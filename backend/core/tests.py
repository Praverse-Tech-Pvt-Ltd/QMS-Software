from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.core.management import call_command
from rest_framework.test import APIClient

from .models import RetentionPolicy, AuditLog

User = get_user_model()


class SeedRetentionPoliciesCommandTests(TestCase):
    def test_seed_creates_exactly_twelve_policies(self):
        call_command('seed_retention_policies')
        self.assertEqual(RetentionPolicy.objects.count(), 12)

    def test_seed_sets_correct_values_for_known_record_types(self):
        call_command('seed_retention_policies')

        document = RetentionPolicy.objects.get(record_type='Document')
        self.assertEqual(document.retention_years, 10)
        self.assertEqual(document.regulatory_basis, '21 CFR 211.68(b) — life of drug + 1 year')

        audit_log = RetentionPolicy.objects.get(record_type='AuditLog')
        self.assertEqual(audit_log.retention_years, 25)
        self.assertEqual(audit_log.regulatory_basis, '21 CFR Part 11 — life of system')

        analyst_qual = RetentionPolicy.objects.get(record_type='AnalystQualification')
        self.assertEqual(analyst_qual.retention_years, 5)
        self.assertEqual(analyst_qual.regulatory_basis, 'GMP — active + 2 years post-expiry')

        stability = RetentionPolicy.objects.get(record_type='StabilityProtocol')
        self.assertEqual(stability.retention_years, 15)

    def test_rerunning_seed_does_not_duplicate_rows(self):
        call_command('seed_retention_policies')
        call_command('seed_retention_policies')
        self.assertEqual(RetentionPolicy.objects.count(), 12)

    def test_rerunning_seed_updates_existing_row_instead_of_duplicating(self):
        call_command('seed_retention_policies')
        policy = RetentionPolicy.objects.get(record_type='Document')
        policy.retention_years = 1
        policy.save()

        call_command('seed_retention_policies')

        self.assertEqual(RetentionPolicy.objects.count(), 12)
        policy.refresh_from_db()
        self.assertEqual(policy.retention_years, 10)


@override_settings(ROOT_URLCONF='core.retention_urls')
class RetentionPolicyAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='ret-admin', password='Secret123!', role='Admin')
        self.viewer = User.objects.create_user(username='ret-viewer', password='Secret123!', role='Viewer')
        self.client = APIClient()
        self.policy = RetentionPolicy.objects.create(
            record_type='Document', retention_years=10, regulatory_basis='21 CFR 211.68(b)')

    def test_any_authenticated_user_can_list_policies(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_any_authenticated_user_can_retrieve_a_policy(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.get(f'/{self.policy.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['record_type'], 'Document')

    def test_non_admin_patch_returns_403(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.patch(f'/{self.policy.pk}/', {'retention_years': 20}, format='json')
        self.assertEqual(response.status_code, 403)
        self.policy.refresh_from_db()
        self.assertEqual(self.policy.retention_years, 10)

    def test_admin_patch_returns_200_and_updates_value(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(f'/{self.policy.pk}/', {'retention_years': 20}, format='json')
        self.assertEqual(response.status_code, 200)
        self.policy.refresh_from_db()
        self.assertEqual(self.policy.retention_years, 20)

    def test_admin_patch_writes_audit_log_with_old_and_new_values(self):
        self.client.force_authenticate(self.admin)
        self.client.patch(f'/{self.policy.pk}/', {'retention_years': 20}, format='json')

        log = AuditLog.objects.filter(object_id=str(self.policy.pk)).latest('timestamp')
        self.assertEqual(log.action, 'UPDATE')
        self.assertEqual(log.user_email, self.admin.email)
        self.assertEqual(log.changes, {'retention_years': {'old': 10, 'new': 20}})

    def test_admin_patch_with_unchanged_value_does_not_write_audit_log(self):
        self.client.force_authenticate(self.admin)
        before_count = AuditLog.objects.filter(object_id=str(self.policy.pk)).count()
        self.client.patch(f'/{self.policy.pk}/', {'retention_years': 10}, format='json')
        after_count = AuditLog.objects.filter(object_id=str(self.policy.pk)).count()
        self.assertEqual(before_count, after_count)
