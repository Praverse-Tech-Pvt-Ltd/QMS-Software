from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from complaints.models import Complaint
from shared.workflow import transition

User = get_user_model()


class ComplaintModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='qa1', password='Secret123!')

    def _make_complaint(self, **overrides):
        defaults = dict(
            received_date=date(2026, 1, 1),
            complainant_type='customer',
            product='Amoxicillin 500mg',
            description='Tablet discoloration reported',
            severity='minor',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return Complaint.objects.create(**defaults)

    def test_complaint_number_auto_generated_with_cmp_prefix(self):
        complaint = self._make_complaint()
        self.assertTrue(complaint.complaint_number.startswith('CMP'))

    def test_critical_complaint_deadline_is_30_days_after_received(self):
        complaint = self._make_complaint(severity='critical')
        self.assertEqual(complaint.response_deadline, date(2026, 1, 31))

    def test_major_complaint_deadline_is_45_days_after_received(self):
        complaint = self._make_complaint(severity='major')
        self.assertEqual(complaint.response_deadline, date(2026, 2, 15))

    def test_minor_complaint_deadline_is_45_days_after_received(self):
        complaint = self._make_complaint(severity='minor')
        self.assertEqual(complaint.response_deadline, date(2026, 2, 15))

    def test_close_without_esig_raises_validation_error(self):
        complaint = self._make_complaint(status='pending_closure')
        with self.assertRaises(ValidationError):
            transition(complaint, 'closed', self.user, reason='Resolved')

    def test_close_with_correct_password_succeeds(self):
        complaint = self._make_complaint(status='pending_closure')
        transition(complaint, 'closed', self.user, reason='Resolved', esig_password='Secret123!')
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'closed')

    def test_history_recorded_after_status_change(self):
        complaint = self._make_complaint(status='pending_closure')
        transition(complaint, 'closed', self.user, reason='Resolved', esig_password='Secret123!')
        self.assertGreaterEqual(complaint.history.count(), 2)


class ComplaintAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cmpqa', password='Secret123!', role='QA')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.complaint = Complaint.objects.create(
            received_date=date(2026, 1, 1),
            complainant_type='customer',
            product='Amoxicillin 500mg',
            description='Tablet discoloration reported',
            severity='critical',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_transition_endpoint_moves_status(self):
        response = self.client.post(f'/api/v1/complaints/{self.complaint.id}/transition/', {'action': 'in_investigation'})
        self.assertEqual(response.status_code, 200)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.status, 'in_investigation')

    def test_flag_mdr_creates_mdr_report(self):
        response = self.client.post(f'/api/v1/complaints/{self.complaint.id}/flag-mdr/')
        self.assertEqual(response.status_code, 200)
        self.complaint.refresh_from_db()
        self.assertTrue(self.complaint.regulatory_reportable)
        self.assertEqual(self.complaint.mdr_reports.count(), 1)

    def test_overdue_endpoint_lists_past_deadline_complaints(self):
        response = self.client.get('/api/v1/complaints/overdue/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.data['count'], 1)
