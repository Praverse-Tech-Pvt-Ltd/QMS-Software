from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from audits.models import Audit
from core.models import AuditLog
from django.contrib.contenttypes.models import ContentType
from shared.models import ActionItem

User = get_user_model()


class BaseModelHardDeleteTests(TestCase):
    """Verify 21 CFR Part 11 hard-delete protection on BaseModel subclasses."""

    def setUp(self):
        self.user = User.objects.create_user(username='harddeltest', password='TestPass123!', role='QA')

    def _make_audit(self):
        return Audit.objects.create(
            type='internal',
            scope='Test audit scope',
            lead_auditor=self.user,
            auditee_department='Production',
            scheduled_date='2026-08-01',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_regulated_model_delete_raises(self):
        """Hard delete on any BaseModel subclass must raise NotImplementedError."""
        audit = self._make_audit()
        with self.assertRaises(NotImplementedError):
            audit.delete()

    def test_soft_delete_sets_is_active_false(self):
        """soft_delete() must set is_active=False without raising."""
        audit = self._make_audit()
        audit.soft_delete(self.user)
        audit.refresh_from_db()
        self.assertFalse(audit.is_active)

    def test_soft_delete_updates_modified_by(self):
        audit = self._make_audit()
        other_user = User.objects.create_user(username='otherqa', password='TestPass123!', role='QA')
        audit.soft_delete(other_user)
        audit.refresh_from_db()
        self.assertEqual(audit.modified_by, other_user)


class AuditLogImmutabilityTests(TestCase):
    """
    AuditLog extends models.Model directly, not shared.models.BaseModel — it gets its
    own delete()/soft_delete() overrides (added directly in core/models.py) since it
    has no is_active field and must never be deactivated either.
    """

    def setUp(self):
        self.user = User.objects.create_user(username='auditlogtest', password='TestPass123!', role='QA')

    def _make_log(self):
        content_type = ContentType.objects.get_for_model(User)
        return AuditLog.objects.create(
            user=self.user,
            user_email=self.user.email,
            action='CREATE',
            content_type=content_type,
            object_id=str(self.user.pk),
            changes={},
        )

    def test_auditlog_delete_raises(self):
        log = self._make_log()
        with self.assertRaises(NotImplementedError):
            log.delete()

    def test_auditlog_soft_delete_raises(self):
        log = self._make_log()
        with self.assertRaises(NotImplementedError):
            log.soft_delete(self.user)


class ActionItemModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='aiqa', password='TestPass123!', role='QA')

    def _make_item(self, **overrides):
        defaults = dict(
            record_type='Audit',
            record_id='audit-001',
            action='Retrain analysts on HPLC method',
            category='training',
            suggested_owner_role='qa_manager',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return ActionItem.objects.create(**defaults)

    def test_created_with_default_status_open(self):
        item = self._make_item()
        self.assertEqual(item.status, 'open')

    def test_delete_raises_not_implemented(self):
        item = self._make_item()
        with self.assertRaises(NotImplementedError):
            item.delete()


class ActionItemAPITests(TestCase):
    def setUp(self):
        self.qa_user = User.objects.create_user(username='aiapiqa', password='TestPass123!', role='QA')
        self.viewer_user = User.objects.create_user(username='aiapiviewer', password='TestPass123!', role='Viewer')
        self.client = APIClient()
        self.client.force_authenticate(self.qa_user)

    def test_extract_actions_persists_action_items(self):
        response = self.client.post('/api/v1/ai/extract-actions/', {
            'remark_texts': ['All analysts must be trained before use.'],
            'record_type': 'Audit',
            'record_id': 'audit-002',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertGreaterEqual(ActionItem.objects.filter(record_id='audit-002').count(), 1)

    def test_extract_actions_get_or_create_does_not_duplicate(self):
        payload = {
            'remark_texts': ['All analysts must be trained before use.'],
            'record_type': 'Audit',
            'record_id': 'audit-003',
        }
        self.client.post('/api/v1/ai/extract-actions/', payload, format='json')
        self.client.post('/api/v1/ai/extract-actions/', payload, format='json')
        self.assertEqual(ActionItem.objects.filter(record_id='audit-003').count(), 1)

    def test_list_action_items_filters_by_record(self):
        ActionItem.objects.create(
            record_type='Audit', record_id='audit-004', action='Do X', category='training',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        ActionItem.objects.create(
            record_type='Audit', record_id='audit-005', action='Do Y', category='validation',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.get('/api/v1/ai/action-items/', {'record_type': 'Audit', 'record_id': 'audit-004'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['record_id'], 'audit-004')

    def test_patch_updates_due_date_and_assigned_to(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-006', action='Do Z', category='documentation',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.patch(f'/api/v1/ai/action-items/{item.id}/', {
            'due_date': '2026-12-01',
            'assigned_to': str(self.qa_user.id),
        }, format='json')
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(str(item.due_date), '2026-12-01')
        self.assertEqual(item.assigned_to, self.qa_user)

    def test_patch_by_viewer_role_is_forbidden(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-007', action='Do W', category='implementation',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        self.client.force_authenticate(self.viewer_user)
        response = self.client.patch(f'/api/v1/ai/action-items/{item.id}/', {'due_date': '2026-12-01'}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_close_requires_evidence_note_min_length(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-008', action='Do V', category='investigation',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.post(f'/api/v1/ai/action-items/{item.id}/close/', {'evidence_note': 'too short'})
        self.assertEqual(response.status_code, 400)

    def test_close_with_valid_evidence_note_succeeds(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-009', action='Do U', category='investigation',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.post(f'/api/v1/ai/action-items/{item.id}/close/', {
            'evidence_note': 'Root cause confirmed and corrective training completed for all analysts.',
        })
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.status, 'closed')

    def test_extend_requires_due_date_and_reason(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-010', action='Do T', category='regulatory_filing',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.post(f'/api/v1/ai/action-items/{item.id}/extend/', {'due_date': '2026-12-31'})
        self.assertEqual(response.status_code, 400)

    def test_extend_with_valid_reason_succeeds(self):
        item = ActionItem.objects.create(
            record_type='Audit', record_id='audit-011', action='Do S', category='regulatory_filing',
            created_by=self.qa_user, modified_by=self.qa_user,
        )
        response = self.client.post(f'/api/v1/ai/action-items/{item.id}/extend/', {
            'due_date': '2026-12-31',
            'extension_reason': 'Awaiting third-party lab results before filing can be completed.',
        })
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.status, 'extended')
        self.assertEqual(str(item.due_date), '2026-12-31')
