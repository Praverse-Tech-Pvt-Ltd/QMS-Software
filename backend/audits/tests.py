from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from audits.models import Audit, Finding
from shared.workflow import transition

User = get_user_model()


class AuditModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='lead1', password='Secret123!')

    def _make_audit(self, **overrides):
        defaults = dict(
            type='internal',
            scope='Annual GMP self-inspection',
            lead_auditor=self.user,
            auditee_department='Production',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return Audit.objects.create(**defaults)

    def test_created_with_default_status(self):
        audit = self._make_audit()
        self.assertEqual(audit.status, 'planned')

    def test_audit_number_auto_generated_with_aud_prefix(self):
        audit = self._make_audit()
        self.assertTrue(audit.audit_number.startswith('AUD'))

    def test_start_transition_moves_to_in_progress(self):
        audit = self._make_audit()
        transition(audit, 'in_progress', self.user, reason='Kickoff')
        audit.refresh_from_db()
        self.assertEqual(audit.status, 'in_progress')

    def test_close_without_esig_raises_validation_error(self):
        audit = self._make_audit(status='completed')
        with self.assertRaises(ValidationError):
            transition(audit, 'closed', self.user, reason='Done')

    def test_close_with_correct_password_succeeds(self):
        audit = self._make_audit(status='completed')
        transition(audit, 'closed', self.user, reason='Done', esig_password='Secret123!')
        audit.refresh_from_db()
        self.assertEqual(audit.status, 'closed')

    def test_close_with_wrong_password_raises_validation_error(self):
        audit = self._make_audit(status='completed')
        with self.assertRaises(ValidationError):
            transition(audit, 'closed', self.user, reason='Done', esig_password='wrong-password')

    def test_history_recorded_after_status_change(self):
        audit = self._make_audit()
        transition(audit, 'in_progress', self.user, reason='Kickoff')
        self.assertGreaterEqual(audit.history.count(), 2)


class FindingModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='lead2', password='Secret123!')
        self.audit = Audit.objects.create(
            type='internal',
            scope='Annual GMP self-inspection',
            lead_auditor=self.user,
            auditee_department='Production',
            created_by=self.user,
            modified_by=self.user,
        )

    def _make_finding(self, severity):
        return Finding.objects.create(
            audit=self.audit,
            severity=severity,
            description='Test finding',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_finding_number_derived_from_audit_number(self):
        finding = self._make_finding('minor')
        self.assertTrue(finding.finding_number.startswith(self.audit.audit_number))

    def test_direct_model_creation_does_not_auto_create_capa(self):
        # NOTE: auto-CAPA creation for critical findings is NOT a model signal (there is none
        # in audits/apps.py) — it only happens inside AuditViewSet.findings() at the API layer.
        # Direct ORM creation (as in this test) bypasses it entirely.
        from quality.models import Capa

        before = Capa.objects.count()
        finding = self._make_finding('critical')
        self.assertIsNone(finding.capa)
        self.assertEqual(Capa.objects.count(), before)

    def test_minor_finding_does_not_create_capa(self):
        from quality.models import Capa

        before = Capa.objects.count()
        self._make_finding('minor')
        self.assertEqual(Capa.objects.count(), before)


class AuditAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='apiqa', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.audit = Audit.objects.create(
            type='internal',
            scope='Annual GMP self-inspection',
            lead_auditor=self.user,
            auditee_department='Production',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_list_audits_returns_created_audit(self):
        response = self.client.get('/api/v1/audits/')
        self.assertEqual(response.status_code, 200)
        numbers = [a['audit_number'] for a in response.data]
        self.assertIn(self.audit.audit_number, numbers)

    def test_transition_endpoint_moves_status(self):
        response = self.client.post(f'/api/v1/audits/{self.audit.id}/transition/', {'action': 'in_progress'})
        self.assertEqual(response.status_code, 200)
        self.audit.refresh_from_db()
        self.assertEqual(self.audit.status, 'in_progress')

    def test_transition_endpoint_rejects_invalid_action(self):
        response = self.client.post(f'/api/v1/audits/{self.audit.id}/transition/', {'action': 'closed'})
        self.assertEqual(response.status_code, 400)

    def test_critical_finding_via_api_auto_creates_capa(self):
        from quality.models import Capa

        before = Capa.objects.count()
        response = self.client.post(f'/api/v1/audits/{self.audit.id}/findings/', {
            'severity': 'critical',
            'description': 'Sterility breach observed during fill line inspection',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Capa.objects.count(), before + 1)

    def test_report_endpoint_returns_summary_counts(self):
        self._make_finding('critical')
        self._make_finding('minor')
        response = self.client.post(f'/api/v1/audits/{self.audit.id}/report/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['summary']['total_findings'], 2)
        self.assertEqual(response.data['summary']['critical'], 1)

    def _make_finding(self, severity):
        return Finding.objects.create(
            audit=self.audit,
            severity=severity,
            description='Test finding',
            created_by=self.user,
            modified_by=self.user,
        )
