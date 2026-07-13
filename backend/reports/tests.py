from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from complaints.models import Complaint

User = get_user_model()


class SPCTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='spcqa', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_invalid_metric_returns_400(self):
        response = self.client.get('/api/v1/reports/spc/', {'metric': 'not_a_real_metric'})
        self.assertEqual(response.status_code, 400)

    def test_default_metric_returns_expected_shape(self):
        response = self.client.get('/api/v1/reports/spc/')
        self.assertEqual(response.status_code, 200)
        for key in ('values', 'dates', 'mean', 'ucl', 'lcl'):
            self.assertIn(key, response.data)
        self.assertEqual(len(response.data['values']), 12)
        self.assertEqual(len(response.data['dates']), 12)

    def test_months_param_controls_series_length(self):
        response = self.client.get('/api/v1/reports/spc/', {'months': 6})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['values']), 6)

    def test_complaint_rate_counts_complaints_in_current_month(self):
        today = timezone.localdate()
        Complaint.objects.create(
            received_date=today, complainant_type='customer', product='Paracetamol',
            description='x', severity='minor',
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.get('/api/v1/reports/spc/', {'metric': 'complaint_rate', 'months': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['values'], [1])

    def test_complaint_rate_filters_by_product(self):
        today = timezone.localdate()
        Complaint.objects.create(
            received_date=today, complainant_type='customer', product='Paracetamol',
            description='x', severity='minor',
            created_by=self.user, modified_by=self.user,
        )
        Complaint.objects.create(
            received_date=today, complainant_type='customer', product='Amoxicillin',
            description='x', severity='minor',
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.get('/api/v1/reports/spc/', {
            'metric': 'complaint_rate', 'months': 1, 'product': 'Paracetamol',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['values'], [1])

    def test_ucl_never_below_lcl_and_lcl_not_negative(self):
        response = self.client.get('/api/v1/reports/spc/', {'metric': 'deviation_rate'})
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data['ucl'], response.data['lcl'])
        self.assertGreaterEqual(response.data['lcl'], 0)
