from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from nonconformance.models import Disposition, NCReport

User = get_user_model()


class NCReportModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ncqa', password='Secret123!')

    def _make_nc(self, **overrides):
        defaults = dict(
            product='Paracetamol 500mg',
            batch_lot='B2026001',
            quantity_affected=100,
            unit='tablets',
            defect_description='Chipped tablets found during in-process check',
            severity='minor',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return NCReport.objects.create(**defaults)

    def test_nc_number_auto_generated_with_nc_prefix(self):
        nc = self._make_nc()
        self.assertTrue(nc.nc_number.startswith('NC'))

    def test_hold_status_defaults_to_true(self):
        nc = self._make_nc()
        self.assertTrue(nc.hold_status)

    def test_history_recorded(self):
        nc = self._make_nc()
        nc.status = 'dispositioned'
        nc.modified_by = self.user
        nc.save()
        self.assertGreaterEqual(nc.history.count(), 2)


class DispositionModelTests(TestCase):
    def test_disposition_has_esignature_fk(self):
        field_names = [f.name for f in Disposition._meta.get_fields()]
        self.assertIn('esignature', field_names)


class NCAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ncapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_create_via_api_auto_places_hold(self):
        # NOTE: must POST as JSON, not multipart — DRF treats an absent BooleanField as an
        # unchecked HTML checkbox (False) for form/multipart submissions, which would mask
        # the model's hold_status=True default. The real frontend always sends JSON.
        response = self.client.post('/api/v1/nc/', {
            'product': 'Paracetamol 500mg',
            'batch_lot': 'B2026002',
            'quantity_affected': '50',
            'unit': 'tablets',
            'defect_description': 'Foreign particle found',
            'severity': 'major',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        nc = NCReport.objects.get(id=response.data['id'])
        self.assertTrue(nc.hold_status)
        self.assertEqual(nc.holds.count(), 1)

    def test_dispose_endpoint_requires_esig(self):
        nc = NCReport.objects.create(
            product='Paracetamol 500mg',
            batch_lot='B2026003',
            quantity_affected=50,
            unit='tablets',
            defect_description='Foreign particle found',
            severity='major',
            created_by=self.user,
            modified_by=self.user,
        )
        response = self.client.post(f'/api/v1/nc/{nc.id}/dispose/', {'decision': 'use_as_is'})
        self.assertEqual(response.status_code, 400)

    def test_dispose_endpoint_with_correct_password_creates_disposition(self):
        nc = NCReport.objects.create(
            product='Paracetamol 500mg',
            batch_lot='B2026004',
            quantity_affected=50,
            unit='tablets',
            defect_description='Foreign particle found',
            severity='major',
            created_by=self.user,
            modified_by=self.user,
        )
        response = self.client.post(f'/api/v1/nc/{nc.id}/dispose/', {
            'decision': 'use_as_is',
            'esig_password': 'Secret123!',
            'justification': 'Within acceptable quality limits',
        })
        self.assertEqual(response.status_code, 201)
        nc.refresh_from_db()
        self.assertEqual(nc.status, 'dispositioned')
        self.assertIsNotNone(nc.disposition)

    def test_release_hold_requires_esig(self):
        nc = NCReport.objects.create(
            product='Paracetamol 500mg',
            batch_lot='B2026005',
            quantity_affected=50,
            unit='tablets',
            defect_description='Foreign particle found',
            severity='major',
            created_by=self.user,
            modified_by=self.user,
        )
        response = self.client.post(f'/api/v1/nc/{nc.id}/release-hold/')
        self.assertEqual(response.status_code, 400)
