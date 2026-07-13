from datetime import date

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from laboratory.models import Instrument

from .models import AnalyticalTechnique, AnalystQualificationRecord

User = get_user_model()


class AnalyticalTechniqueModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='aqtech', password='Secret123!')

    def test_soft_delete_raises_not_implemented_error(self):
        technique = AnalyticalTechnique.objects.create(
            name='HPLC Assay', complexity='complex',
            created_by=self.user, modified_by=self.user,
        )
        with self.assertRaises(NotImplementedError):
            technique.delete()


class AnalystQualificationRecordModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='aqmodel', password='Secret123!')
        self.analyst = User.objects.create_user(username='aqanalyst', password='Secret123!')
        self.technique = AnalyticalTechnique.objects.create(
            name='Karl Fischer Titration', complexity='non_complex',
            created_by=self.user, modified_by=self.user,
        )

    def test_qualification_id_auto_generated_with_aqr_prefix(self):
        record = AnalystQualificationRecord.objects.create(
            analyst=self.analyst, technique=self.technique,
            created_by=self.user, modified_by=self.user,
        )
        self.assertTrue(record.qualification_id.startswith('AQR'))

    def test_save_sets_expiry_date_one_year_after_qualification_date(self):
        record = AnalystQualificationRecord.objects.create(
            analyst=self.analyst, technique=self.technique,
            qualification_date=date(2026, 1, 15),
            created_by=self.user, modified_by=self.user,
        )
        self.assertEqual(record.expiry_date, date(2027, 1, 15))

    def test_save_does_not_override_explicit_expiry_date(self):
        record = AnalystQualificationRecord.objects.create(
            analyst=self.analyst, technique=self.technique,
            qualification_date=date(2026, 1, 15),
            expiry_date=date(2026, 6, 1),
            created_by=self.user, modified_by=self.user,
        )
        self.assertEqual(record.expiry_date, date(2026, 6, 1))

    def test_unique_together_analyst_technique_instrument_raises_integrity_error(self):
        instrument = Instrument.objects.create(
            name='HPLC Unit 1', created_by=self.user, modified_by=self.user,
        )
        AnalystQualificationRecord.objects.create(
            analyst=self.analyst, technique=self.technique, instrument=instrument,
            created_by=self.user, modified_by=self.user,
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                AnalystQualificationRecord.objects.create(
                    analyst=self.analyst, technique=self.technique, instrument=instrument,
                    created_by=self.user, modified_by=self.user,
                )

    def test_soft_delete_raises_not_implemented_error(self):
        record = AnalystQualificationRecord.objects.create(
            analyst=self.analyst, technique=self.technique,
            created_by=self.user, modified_by=self.user,
        )
        with self.assertRaises(NotImplementedError):
            record.delete()


class AnalystQualificationAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='aqapi', password='Secret123!')
        self.analyst = User.objects.create_user(username='aqapianalyst', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.technique = AnalyticalTechnique.objects.create(
            name='UV Spectrophotometry', complexity='complex',
            created_by=self.user, modified_by=self.user,
        )

    def _create_record(self):
        response = self.client.post('/api/v1/analyst-qualification/records/', {
            'analyst': str(self.analyst.id),
            'technique': str(self.technique.id),
            'qualification_date': '2026-01-01',
        }, format='json')
        return response

    def test_create_technique_via_api(self):
        response = self.client.post('/api/v1/analyst-qualification/techniques/', {
            'name': 'Dissolution Testing', 'complexity': 'complex',
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_create_record_via_api(self):
        response = self._create_record()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'pending')

    def test_transition_submit_to_under_review_succeeds_without_esig(self):
        record_id = self._create_record().data['id']
        response = self.client.post(
            f'/api/v1/analyst-qualification/records/{record_id}/transition/',
            {'action': 'under_review'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'under_review')

    def test_transition_to_qualified_without_esig_fails(self):
        record_id = self._create_record().data['id']
        self.client.post(f'/api/v1/analyst-qualification/records/{record_id}/transition/', {'action': 'under_review'})
        response = self.client.post(
            f'/api/v1/analyst-qualification/records/{record_id}/transition/',
            {'action': 'qualified'},
        )
        self.assertEqual(response.status_code, 400)

    def test_transition_to_qualified_with_esig_succeeds_and_stamps_approved_by(self):
        record_id = self._create_record().data['id']
        self.client.post(f'/api/v1/analyst-qualification/records/{record_id}/transition/', {'action': 'under_review'})
        response = self.client.post(
            f'/api/v1/analyst-qualification/records/{record_id}/transition/',
            {'action': 'qualified', 'esig_password': 'Secret123!'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'qualified')
        record = AnalystQualificationRecord.objects.get(id=record_id)
        self.assertEqual(record.approved_by_id, self.user.id)

    def test_transition_to_not_qualified_with_esig_succeeds(self):
        record_id = self._create_record().data['id']
        self.client.post(f'/api/v1/analyst-qualification/records/{record_id}/transition/', {'action': 'under_review'})
        response = self.client.post(
            f'/api/v1/analyst-qualification/records/{record_id}/transition/',
            {'action': 'not_qualified', 'esig_password': 'Secret123!'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'not_qualified')

    def test_expiring_endpoint_filters_qualified_within_30_days(self):
        near_id = self._create_record().data['id']
        self.client.post(f'/api/v1/analyst-qualification/records/{near_id}/transition/', {'action': 'under_review'})
        self.client.post(
            f'/api/v1/analyst-qualification/records/{near_id}/transition/',
            {'action': 'qualified', 'esig_password': 'Secret123!'},
        )
        near = AnalystQualificationRecord.objects.get(id=near_id)
        near.expiry_date = date.today()
        near.save(update_fields=['expiry_date'])

        response = self.client.get('/api/v1/analyst-qualification/records/expiring/')
        self.assertEqual(response.status_code, 200)
        ids = [r['id'] for r in response.data]
        self.assertIn(near_id, ids)

    def test_matrix_endpoint_returns_nested_analyst_technique_status(self):
        record_id = self._create_record().data['id']
        response = self.client.get('/api/v1/analyst-qualification/records/matrix/')
        self.assertEqual(response.status_code, 200)
        analyst_key = str(self.analyst.id)
        technique_key = str(self.technique.id)
        self.assertIn(analyst_key, response.data)
        self.assertIn(technique_key, response.data[analyst_key])
        self.assertEqual(response.data[analyst_key][technique_key]['status'], 'pending')
        self.assertIsNotNone(record_id)
