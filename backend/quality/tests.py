from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ChangeControl, CCFTemplate

User = get_user_model()


class CCFTemplateRenderTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ccfqa', password='Secret123!')

    def test_render_substitutes_placeholders_from_change_control(self):
        template = CCFTemplate.objects.create(
            change_category='STANDARD', name='Standard CCF',
            template_fields={'summary': 'Change: {title} — {justification}'},
            created_by=self.user, modified_by=self.user,
        )
        cc = ChangeControl.objects.create(
            title='Update calibration frequency', description='x',
            justification='Reduce drift risk', change_type='STANDARD',
            department='QC', initiator=self.user,
        )
        rendered = template.render(cc)
        self.assertEqual(rendered['summary'], 'Change: Update calibration frequency — Reduce drift risk')

    def test_render_leaves_field_unchanged_on_missing_placeholder(self):
        template = CCFTemplate.objects.create(
            change_category='STANDARD', name='Bad CCF',
            template_fields={'summary': 'Value: {not_a_real_field}'},
            created_by=self.user, modified_by=self.user,
        )
        cc = ChangeControl.objects.create(
            title='X', description='x', justification='x', change_type='STANDARD',
            department='QC', initiator=self.user,
        )
        rendered = template.render(cc)
        self.assertEqual(rendered['summary'], 'Value: {not_a_real_field}')


class CCFTemplateApplicationAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ccfapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_create_change_control_applies_matching_template(self):
        CCFTemplate.objects.create(
            change_category='EMERGENCY', name='Emergency CCF',
            template_fields={'header': 'EMERGENCY CHANGE: {title}'},
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.post('/api/quality/change-control/', {
            'title': 'Replace failed HVAC unit',
            'description': 'x',
            'justification': 'Unit failure risks temperature excursion',
            'change_type': 'EMERGENCY',
            'department': 'Facilities',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        cc = ChangeControl.objects.get(cc_id=response.data['cc_id'])
        self.assertEqual(cc.filled_ccf['header'], 'EMERGENCY CHANGE: Replace failed HVAC unit')

    def test_create_change_control_without_matching_template_uses_default(self):
        CCFTemplate.objects.create(
            change_category='PERMANENT', name='Permanent CCF',
            template_fields={'header': 'Should not match'},
            created_by=self.user, modified_by=self.user,
        )
        CCFTemplate.objects.create(
            change_category='OTHER', name='Default CCF', is_default=True,
            template_fields={'header': 'Default header: {title}'},
            created_by=self.user, modified_by=self.user,
        )
        response = self.client.post('/api/quality/change-control/', {
            'title': 'Standard change',
            'description': 'x', 'justification': 'x',
            'change_type': 'STANDARD',  # no template registered for STANDARD
            'department': 'QA',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        cc = ChangeControl.objects.get(cc_id=response.data['cc_id'])
        self.assertEqual(cc.filled_ccf['header'], 'Default header: Standard change')

    def test_create_change_control_without_any_template_leaves_filled_ccf_empty(self):
        response = self.client.post('/api/quality/change-control/', {
            'title': 'No template change',
            'description': 'x', 'justification': 'x',
            'change_type': 'STANDARD',
            'department': 'QA',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        cc = ChangeControl.objects.get(cc_id=response.data['cc_id'])
        self.assertEqual(cc.filled_ccf, {})

    def test_filled_ccf_is_not_client_writable(self):
        response = self.client.post('/api/quality/change-control/', {
            'title': 'Attempted override',
            'description': 'x', 'justification': 'x',
            'change_type': 'STANDARD', 'department': 'QA',
            'filled_ccf': {'header': 'client supplied'},
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['filled_ccf'], {})

    def test_ccf_template_crud(self):
        create_response = self.client.post('/api/quality/ccf-templates/', {
            'change_category': 'TEMPORARY',
            'name': 'Temporary CCF',
            'template_fields': {'note': 'Temp: {title}'},
        }, format='json')
        self.assertEqual(create_response.status_code, 201)

        list_response = self.client.get('/api/quality/ccf-templates/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
