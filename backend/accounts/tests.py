from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import PasswordHistory, Site
from .password_validators import ComplexityValidator, HistoryValidator
from .tasks import check_password_expiry

User = get_user_model()


class SiteAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='site-admin', password='Secret123!', role='Admin')
        self.viewer = User.objects.create_user(username='site-viewer', password='Secret123!', role='Viewer')
        self.client = APIClient()

    def test_any_authenticated_user_can_list_sites(self):
        Site.objects.create(name='Mumbai Plant', code='MUM')
        self.client.force_authenticate(self.viewer)
        response = self.client.get('/api/v1/accounts/sites/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_non_admin_cannot_create_site(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.post('/api/v1/accounts/sites/', {'name': 'Pune Plant', 'code': 'PUN'})
        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_site(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/v1/accounts/sites/', {'name': 'Pune Plant', 'code': 'PUN'})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Site.objects.filter(code='PUN').exists())


class LoginResponseSiteTests(TestCase):
    def test_login_response_includes_site(self):
        site = Site.objects.create(name='Mumbai Plant', code='MUM')
        User.objects.create_user(username='siteuser', password='Secret123!', role='QC', site=site)
        client = APIClient()
        response = client.post('/api/auth/login/', {'username': 'siteuser', 'password': 'Secret123!'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['site'], site.id)
        self.assertEqual(response.data['site_name'], 'Mumbai Plant')


class SiteScopedQuerysetTests(TestCase):
    """End-to-end check of shared.site_scoping.SiteScopedQuerysetMixin via a real app (audits)."""

    def setUp(self):
        self.site_a = Site.objects.create(name='Mumbai Plant', code='MUM')
        self.site_b = Site.objects.create(name='Pune Plant', code='PUN')
        self.admin = User.objects.create_user(username='auditadmin', password='Secret123!', role='Admin')
        self.user_a = User.objects.create_user(username='audituser-a', password='Secret123!', role='QA', site=self.site_a)
        self.client = APIClient()

    def _create_audit(self, site, owner):
        from audits.models import Audit
        return Audit.objects.create(
            type='internal', scope='Test scope', lead_auditor=owner,
            auditee_department='QA', site=site,
            created_by=owner, modified_by=owner,
        )

    def test_non_admin_only_sees_own_site_records(self):
        self._create_audit(self.site_a, self.user_a)
        self._create_audit(self.site_b, self.user_a)

        self.client.force_authenticate(self.user_a)
        response = self.client.get('/api/v1/audits/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_admin_sees_all_sites_by_default(self):
        self._create_audit(self.site_a, self.admin)
        self._create_audit(self.site_b, self.admin)

        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/audits/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_admin_can_filter_by_site_query_param(self):
        self._create_audit(self.site_a, self.admin)
        self._create_audit(self.site_b, self.admin)

        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/v1/audits/', {'site': str(self.site_a.id)})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)


class PasswordPolicyTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='pwuser', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_complexity_validator_rejects_all_lowercase(self):
        with self.assertRaises(ValidationError):
            ComplexityValidator().validate('alllowercase1!')  # missing uppercase

    def test_history_validator_rejects_reuse_of_previous_password(self):
        # setUp's create_user() already recorded 'Secret123!' via the
        # post_save signal — reusing it must be rejected.
        with self.assertRaises(ValidationError):
            HistoryValidator().validate('Secret123!', user=self.user)

    def test_check_password_expiry_flags_users_with_old_passwords(self):
        old_date = timezone.now() - timedelta(days=91)
        User.objects.filter(pk=self.user.pk).update(
            password_changed_at=old_date, must_change_password=False,
        )
        result = check_password_expiry()
        self.assertEqual(result['flagged'], 1)
        self.user.refresh_from_db()
        self.assertTrue(self.user.must_change_password)

    def test_login_response_includes_must_change_password_field(self):
        response = self.client.post(
            '/api/auth/login/', {'username': 'pwuser', 'password': 'Secret123!'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('must_change_password', response.data)
        self.assertFalse(response.data['must_change_password'])

    def test_change_password_wrong_current_password_returns_400(self):
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'WrongPassword1!',
            'new_password': 'BrandNewPass9!',
        })
        self.assertEqual(response.status_code, 400)

    def test_change_password_valid_returns_200_and_clears_flag(self):
        User.objects.filter(pk=self.user.pk).update(must_change_password=True)
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'Secret123!',
            'new_password': 'BrandNewPass9!',
        })
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.must_change_password)
        self.assertTrue(self.user.check_password('BrandNewPass9!'))
        self.assertIsNotNone(self.user.password_changed_at)


class PasswordHistorySignalTests(TestCase):
    def test_password_change_creates_history_row(self):
        user = User.objects.create_user(username='histuser', password='Secret123!')
        self.assertEqual(PasswordHistory.objects.filter(user=user).count(), 1)

        user.set_password('AnotherPass2!')
        user.save()
        self.assertEqual(PasswordHistory.objects.filter(user=user).count(), 2)

    def test_unrelated_field_update_does_not_create_history_row(self):
        user = User.objects.create_user(username='histuser2', password='Secret123!')
        self.assertEqual(PasswordHistory.objects.filter(user=user).count(), 1)

        user.department = 'QC Lab'
        user.save()
        self.assertEqual(PasswordHistory.objects.filter(user=user).count(), 1)

    def test_history_trimmed_to_configured_count(self):
        from django.test import override_settings

        user = User.objects.create_user(username='histuser3', password='Secret123!')
        with override_settings(PASSWORD_HISTORY_COUNT=2):
            for i in range(4):
                user.set_password(f'Password{i}!A')
                user.save()
            self.assertEqual(PasswordHistory.objects.filter(user=user).count(), 2)
