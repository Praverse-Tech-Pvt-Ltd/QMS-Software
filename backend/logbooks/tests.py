from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Logbook, LogbookEntry

User = get_user_model()


class LogbookModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='logqa', password='Secret123!')

    def _make_logbook(self, **overrides):
        defaults = dict(
            name='Autoclave #1',
            logbook_type='equipment',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return Logbook.objects.create(**defaults)

    def test_soft_delete_raises_not_implemented_error(self):
        logbook = self._make_logbook()
        with self.assertRaises(NotImplementedError):
            logbook.delete()

    def test_soft_delete_deactivates_without_deleting(self):
        logbook = self._make_logbook()
        logbook.soft_delete(self.user)
        logbook.refresh_from_db()
        self.assertFalse(logbook.is_active)
        self.assertTrue(Logbook.objects.filter(pk=logbook.pk).exists())

    def test_history_recorded(self):
        logbook = self._make_logbook()
        logbook.department = 'QC'
        logbook.modified_by = self.user
        logbook.save()
        self.assertGreaterEqual(logbook.history.count(), 2)


class LogbookAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='logapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.logbook = Logbook.objects.create(
            name='Cleanroom A',
            logbook_type='area',
            department='Production',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_create_entry_without_esig_password_returns_400(self):
        response = self.client.post(f'/api/v1/logbooks/{self.logbook.id}/entries/', {
            'entry_date': '2026-07-13',
            'entry_time': '09:00:00',
            'activity': 'Routine cleaning performed',
            'condition': 'normal',
        })
        self.assertEqual(response.status_code, 400)
        self.assertEqual(LogbookEntry.objects.count(), 0)

    def test_create_entry_with_wrong_password_returns_400(self):
        response = self.client.post(f'/api/v1/logbooks/{self.logbook.id}/entries/', {
            'entry_date': '2026-07-13',
            'entry_time': '09:00:00',
            'activity': 'Routine cleaning performed',
            'condition': 'normal',
            'esig_password': 'wrong-password',
        })
        self.assertEqual(response.status_code, 400)

    def test_create_entry_with_correct_password_creates_entry_and_esignature(self):
        response = self.client.post(f'/api/v1/logbooks/{self.logbook.id}/entries/', {
            'entry_date': '2026-07-13',
            'entry_time': '09:00:00',
            'activity': 'Routine cleaning performed',
            'condition': 'normal',
            'esig_password': 'Secret123!',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        entry = LogbookEntry.objects.get(id=response.data['id'])
        self.assertEqual(entry.performed_by, self.user)
        self.assertIsNotNone(entry.esignature)
        self.assertEqual(entry.esignature.record_type, 'LogbookEntry')

    def test_entries_endpoint_filters_by_date_range(self):
        LogbookEntry.objects.create(
            logbook=self.logbook, entry_date='2026-01-01', entry_time='08:00:00',
            activity='Old entry', performed_by=self.user,
            esignature=self._esig(), created_by=self.user, modified_by=self.user,
        )
        LogbookEntry.objects.create(
            logbook=self.logbook, entry_date='2026-07-13', entry_time='08:00:00',
            activity='Recent entry', performed_by=self.user,
            esignature=self._esig(), created_by=self.user, modified_by=self.user,
        )
        response = self.client.get(f'/api/v1/logbooks/{self.logbook.id}/entries/', {'date_from': '2026-07-01'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['activity'], 'Recent entry')

    def test_logbook_list_shows_last_entry_date(self):
        LogbookEntry.objects.create(
            logbook=self.logbook, entry_date='2026-07-13', entry_time='08:00:00',
            activity='Recent entry', performed_by=self.user,
            esignature=self._esig(), created_by=self.user, modified_by=self.user,
        )
        response = self.client.get('/api/v1/logbooks/')
        self.assertEqual(response.status_code, 200)
        record = next(r for r in response.data if r['id'] == str(self.logbook.id))
        self.assertEqual(str(record['last_entry_date']), '2026-07-13')
        self.assertEqual(record['entry_count'], 1)

    def test_patch_ai_remark_draft_on_entry(self):
        entry = LogbookEntry.objects.create(
            logbook=self.logbook, entry_date='2026-07-13', entry_time='08:00:00',
            activity='Pressure spike observed', performed_by=self.user, condition='abnormal',
            esignature=self._esig(), created_by=self.user, modified_by=self.user,
        )
        response = self.client.patch(f'/api/v1/logbooks/entries/{entry.id}/', {
            'ai_remark_draft': 'AI-drafted remark text',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        entry.refresh_from_db()
        self.assertEqual(entry.ai_remark_draft, 'AI-drafted remark text')

    def _esig(self):
        from shared.models import ESignature
        return ESignature.objects.create(
            user=self.user, password_hash='irrelevant-for-test',
            record_type='LogbookEntry', record_id=str(self.logbook.pk), action='create_entry',
        )
