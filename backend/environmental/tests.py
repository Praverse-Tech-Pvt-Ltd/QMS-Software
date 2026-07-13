from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import EMSamplingPlan, EMResult

User = get_user_model()


class EMResultModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='emqa', password='Secret123!')
        self.plan = EMSamplingPlan.objects.create(
            area='Filling Room A', classification='A', monitoring_type='viable',
            frequency='Weekly', action_limit=10, alert_limit=5,
            created_by=self.user, modified_by=self.user,
        )

    def _make_result(self, value, **overrides):
        defaults = dict(
            sampling_plan=self.plan, sampling_date=date(2026, 7, 13),
            sampled_by=self.user, result_value=value,
            created_by=self.user, modified_by=self.user,
        )
        defaults.update(overrides)
        return EMResult.objects.create(**defaults)

    def test_result_status_normal_below_alert_limit(self):
        result = self._make_result(3)
        self.assertEqual(result.result_status, 'normal')

    def test_result_status_alert_at_alert_limit(self):
        result = self._make_result(5)
        self.assertEqual(result.result_status, 'alert')

    def test_result_status_action_at_action_limit(self):
        result = self._make_result(10)
        self.assertEqual(result.result_status, 'action')

    def test_action_limit_breach_auto_creates_linked_deviation(self):
        result = self._make_result(15)
        self.assertIsNotNone(result.linked_deviation)
        self.assertEqual(result.linked_deviation.risk_level, 'CRITICAL')  # Grade A

    def test_alert_level_does_not_create_deviation(self):
        result = self._make_result(5)
        self.assertIsNone(result.linked_deviation)

    def test_non_grade_ab_breach_creates_major_not_critical(self):
        plan_d = EMSamplingPlan.objects.create(
            area='Warehouse', classification='D', monitoring_type='non_viable',
            frequency='Monthly', action_limit=100, alert_limit=50,
            created_by=self.user, modified_by=self.user,
        )
        result = self._make_result(150, sampling_plan=plan_d)
        self.assertEqual(result.linked_deviation.risk_level, 'MAJOR')

    def test_soft_delete_raises_not_implemented_error(self):
        with self.assertRaises(NotImplementedError):
            self.plan.delete()


class EMAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='emapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.plan = EMSamplingPlan.objects.create(
            area='Filling Room A', classification='B', monitoring_type='viable',
            frequency='Weekly', action_limit=10, alert_limit=5,
            created_by=self.user, modified_by=self.user,
        )

    def test_create_result_via_api(self):
        response = self.client.post('/api/v1/environmental/results/', {
            'sampling_plan': str(self.plan.id),
            'sampling_date': '2026-07-13',
            'result_value': '3.0',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['result_status'], 'normal')
        self.assertEqual(response.data['sampled_by'], self.user.id)

    def test_trends_endpoint_requires_area(self):
        response = self.client.get('/api/v1/environmental/results/trends/')
        self.assertEqual(response.status_code, 400)

    def test_trends_endpoint_returns_series_with_limits(self):
        EMResult.objects.create(
            sampling_plan=self.plan, sampling_date=date(2026, 7, 1), sampled_by=self.user,
            result_value=2, created_by=self.user, modified_by=self.user,
        )
        EMResult.objects.create(
            sampling_plan=self.plan, sampling_date=date(2026, 7, 10), sampled_by=self.user,
            result_value=4, created_by=self.user, modified_by=self.user,
        )
        response = self.client.get('/api/v1/environmental/results/trends/', {'area': 'Filling Room A'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['values'], [2.0, 4.0])
        self.assertEqual(response.data['action_limit'], 10.0)
        self.assertEqual(response.data['alert_limit'], 5.0)
