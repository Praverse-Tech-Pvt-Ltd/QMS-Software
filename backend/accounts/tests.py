from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Site

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
