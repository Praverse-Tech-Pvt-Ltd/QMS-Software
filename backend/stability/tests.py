from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import StabilityProtocol, StabilityPullPoint, add_months

User = get_user_model()


class AddMonthsTests(TestCase):
    def test_add_months_handles_year_rollover(self):
        self.assertEqual(add_months(date(2026, 11, 15), 3), date(2027, 2, 15))

    def test_add_months_clamps_day_to_shorter_month(self):
        self.assertEqual(add_months(date(2026, 1, 31), 1), date(2026, 2, 28))


class StabilityProtocolModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='stabqa', password='Secret123!')

    def _make_protocol(self, **overrides):
        defaults = dict(
            product='Paracetamol 500mg',
            batch_lot='B2026001',
            study_type='accelerated',
            storage_condition='40C/75%RH',
            study_start_date=date(2026, 1, 1),
            planned_end_date=date(2026, 7, 1),
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return StabilityProtocol.objects.create(**defaults)

    def test_protocol_number_auto_generated_with_stb_prefix(self):
        protocol = self._make_protocol()
        self.assertTrue(protocol.protocol_number.startswith('STB'))

    def test_generate_pull_points_creates_one_per_time_point(self):
        protocol = self._make_protocol()
        protocol.generate_pull_points()
        self.assertEqual(protocol.pull_points.count(), 3)  # accelerated: 0, 3, 6 months
        time_points = set(protocol.pull_points.values_list('time_point', flat=True))
        self.assertEqual(time_points, {'0M', '3M', '6M'})

    def test_generate_pull_points_is_idempotent(self):
        protocol = self._make_protocol()
        protocol.generate_pull_points()
        protocol.generate_pull_points()
        self.assertEqual(protocol.pull_points.count(), 3)

    def test_soft_delete_raises_not_implemented_error(self):
        protocol = self._make_protocol()
        with self.assertRaises(NotImplementedError):
            protocol.delete()


class StabilityAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='stabapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _create_protocol(self):
        response = self.client.post('/api/v1/stability/protocols/', {
            'product': 'Paracetamol 500mg',
            'batch_lot': 'B2026002',
            'study_type': 'stress',
            'storage_condition': '50C/75%RH',
            'study_start_date': '2026-01-01',
            'planned_end_date': '2026-04-01',
        }, format='json')
        return response

    def test_create_protocol_auto_generates_pull_points(self):
        response = self._create_protocol()
        self.assertEqual(response.status_code, 201)
        protocol = StabilityProtocol.objects.get(id=response.data['id'])
        self.assertEqual(protocol.pull_points.count(), 4)  # stress: 0,1,2,3 months

    def test_transition_to_approved_requires_esig(self):
        protocol = StabilityProtocol.objects.create(
            product='X', batch_lot='B1', study_type='long_term', storage_condition='25C/60%RH',
            study_start_date=date(2026, 1, 1), planned_end_date=date(2029, 1, 1),
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.post(f'/api/v1/stability/protocols/{protocol.id}/transition/', {
            'action': 'approved',
        })
        self.assertEqual(response.status_code, 400)

    def test_transition_to_approved_with_esig_succeeds(self):
        protocol = StabilityProtocol.objects.create(
            product='X', batch_lot='B1', study_type='long_term', storage_condition='25C/60%RH',
            study_start_date=date(2026, 1, 1), planned_end_date=date(2029, 1, 1),
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.post(f'/api/v1/stability/protocols/{protocol.id}/transition/', {
            'action': 'approved',
            'esig_password': 'Secret123!',
        })
        self.assertEqual(response.status_code, 200)
        protocol.refresh_from_db()
        self.assertEqual(protocol.status, 'approved')

    def test_pull_points_endpoint_returns_nested_list(self):
        response = self._create_protocol()
        protocol_id = response.data['id']
        pp_response = self.client.get(f'/api/v1/stability/protocols/{protocol_id}/pull-points/')
        self.assertEqual(pp_response.status_code, 200)
        self.assertEqual(len(pp_response.data), 4)

    def test_upcoming_endpoint_filters_pending_within_30_days(self):
        response = self._create_protocol()
        protocol = StabilityProtocol.objects.get(id=response.data['id'])
        near = protocol.pull_points.get(time_point='0M')
        near.scheduled_date = date.today()
        near.save()
        far = protocol.pull_points.get(time_point='3M')
        far.scheduled_date = date.today().replace(year=date.today().year + 5)
        far.save()

        upcoming_response = self.client.get('/api/v1/stability/pull-points/upcoming/')
        self.assertEqual(upcoming_response.status_code, 200)
        ids = [r['id'] for r in upcoming_response.data]
        self.assertIn(str(near.id), ids)
        self.assertNotIn(str(far.id), ids)

    def test_patch_pull_point_sets_oot_flag_and_ai_remark_draft(self):
        response = self._create_protocol()
        protocol = StabilityProtocol.objects.get(id=response.data['id'])
        pull_point = protocol.pull_points.get(time_point='0M')

        patch_response = self.client.patch(f'/api/v1/stability/pull-points/{pull_point.id}/', {
            'oot_flag': True,
            'ai_remark_draft': 'AI-drafted OOT remark',
        }, format='json')
        self.assertEqual(patch_response.status_code, 200)
        pull_point.refresh_from_db()
        self.assertTrue(pull_point.oot_flag)
        self.assertEqual(pull_point.ai_remark_draft, 'AI-drafted OOT remark')

    def test_pull_point_status_updates_correctly(self):
        response = self._create_protocol()
        protocol = StabilityProtocol.objects.get(id=response.data['id'])
        pull_point = protocol.pull_points.get(time_point='0M')
        self.assertEqual(pull_point.status, 'pending')

        pulled_response = self.client.patch(f'/api/v1/stability/pull-points/{pull_point.id}/', {
            'status': 'pulled', 'actual_date': '2026-01-01',
        }, format='json')
        self.assertEqual(pulled_response.status_code, 200)
        pull_point.refresh_from_db()
        self.assertEqual(pull_point.status, 'pulled')
        self.assertEqual(str(pull_point.actual_date), '2026-01-01')

        completed_response = self.client.patch(f'/api/v1/stability/pull-points/{pull_point.id}/', {
            'status': 'completed',
        }, format='json')
        self.assertEqual(completed_response.status_code, 200)
        pull_point.refresh_from_db()
        self.assertEqual(pull_point.status, 'completed')
