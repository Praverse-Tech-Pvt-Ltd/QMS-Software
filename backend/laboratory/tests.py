from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Instrument, CalibrationRecord

User = get_user_model()


class InstrumentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='labqa', password='Secret123!')

    def _make_instrument(self, **overrides):
        defaults = dict(
            name='HPLC System 1',
            calibration_frequency_days=180,
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return Instrument.objects.create(**defaults)

    def test_instrument_id_auto_generated_with_inst_prefix(self):
        instrument = self._make_instrument()
        self.assertTrue(instrument.instrument_id.startswith('INST'))

    def test_next_calibration_date_derived_from_last_calibration_plus_frequency(self):
        instrument = self._make_instrument(last_calibration_date=date(2026, 1, 1))
        self.assertEqual(instrument.next_calibration_date, date(2026, 1, 1) + timedelta(days=180))

    def test_next_calibration_date_none_without_last_calibration(self):
        instrument = self._make_instrument()
        self.assertIsNone(instrument.next_calibration_date)

    def test_soft_delete_raises_not_implemented_error(self):
        instrument = self._make_instrument()
        with self.assertRaises(NotImplementedError):
            instrument.delete()


class InstrumentAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='labapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.instrument = Instrument.objects.create(
            name='pH Meter 3', calibration_frequency_days=365, department='QC',
            created_by=self.user, modified_by=self.user,
        )

    def test_record_calibration_without_esig_returns_400(self):
        response = self.client.post(f'/api/v1/laboratory/instruments/{self.instrument.id}/calibrations/', {
            'calibration_date': '2026-07-13',
            'calibration_type': 'external',
            'result': 'pass',
            'next_due_date': '2027-07-13',
        })
        self.assertEqual(response.status_code, 400)
        self.assertEqual(CalibrationRecord.objects.count(), 0)

    def test_record_calibration_with_correct_password_updates_instrument(self):
        response = self.client.post(f'/api/v1/laboratory/instruments/{self.instrument.id}/calibrations/', {
            'calibration_date': '2026-07-13',
            'calibration_type': 'external',
            'result': 'pass',
            'certificate_number': 'CAL-2026-001',
            'next_due_date': '2027-07-13',
            'esig_password': 'Secret123!',
        }, format='json')
        self.assertEqual(response.status_code, 201)

        self.instrument.refresh_from_db()
        self.assertEqual(self.instrument.last_calibration_date, date(2026, 7, 13))
        self.assertEqual(self.instrument.status, 'active')
        self.assertEqual(
            self.instrument.next_calibration_date,
            date(2026, 7, 13) + timedelta(days=365),
        )

        record = CalibrationRecord.objects.get()
        self.assertIsNotNone(record.esignature)
        self.assertEqual(record.performed_by, self.user)

    def test_failed_calibration_marks_instrument_out_of_service(self):
        response = self.client.post(f'/api/v1/laboratory/instruments/{self.instrument.id}/calibrations/', {
            'calibration_date': '2026-07-13',
            'calibration_type': 'internal',
            'result': 'fail',
            'next_due_date': '2026-08-13',
            'esig_password': 'Secret123!',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.instrument.refresh_from_db()
        self.assertEqual(self.instrument.status, 'out_of_service')

    def test_overdue_endpoint_returns_instruments_due_within_30_days(self):
        self.instrument.last_calibration_date = date.today() - timedelta(days=360)
        self.instrument.calibration_frequency_days = 365
        self.instrument.save()

        other = Instrument.objects.create(
            name='Balance 1', calibration_frequency_days=365,
            last_calibration_date=date.today(),
            created_by=self.user, modified_by=self.user,
        )

        response = self.client.get('/api/v1/laboratory/instruments/overdue/')
        self.assertEqual(response.status_code, 200)
        ids = [r['id'] for r in response.data]
        self.assertIn(str(self.instrument.id), ids)
        self.assertNotIn(str(other.id), ids)
