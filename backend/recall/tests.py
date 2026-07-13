from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import RecallRecord

User = get_user_model()


class RecallModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='recallqa', password='Secret123!')

    def _make_recall(self, **overrides):
        defaults = dict(
            product='Paracetamol 500mg',
            batch_lots=['B2026001', 'B2026002'],
            recall_class='II',
            reason='Contamination found in retained sample',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return RecallRecord.objects.create(**defaults)

    def test_recall_number_auto_generated_with_rcl_prefix(self):
        recall = self._make_recall()
        self.assertTrue(recall.recall_number.startswith('RCL'))

    def test_status_defaults_to_initiated(self):
        recall = self._make_recall()
        self.assertEqual(recall.status, 'initiated')

    def test_soft_delete_raises_not_implemented_error(self):
        recall = self._make_recall()
        with self.assertRaises(NotImplementedError):
            recall.delete()


class RecallAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='recallapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def _create_recall(self, recall_class='I'):
        response = self.client.post('/api/v1/recall/', {
            'product': 'Amoxicillin 250mg',
            'batch_lots': ['B2026010'],
            'recall_class': recall_class,
            'reason': 'Sterility failure',
        }, format='json')
        return response

    def test_create_recall_via_api(self):
        response = self._create_recall()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'initiated')

    def test_transition_to_active_requires_esig(self):
        response = self._create_recall()
        recall_id = response.data['id']
        transition_response = self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'active'})
        self.assertEqual(transition_response.status_code, 400)

    def test_transition_to_active_with_esig_succeeds(self):
        response = self._create_recall()
        recall_id = response.data['id']
        transition_response = self.client.post(f'/api/v1/recall/{recall_id}/transition/', {
            'action': 'active', 'esig_password': 'Secret123!',
        })
        self.assertEqual(transition_response.status_code, 200)
        self.assertEqual(transition_response.data['status'], 'active')

    def test_active_endpoint_only_returns_active_recalls(self):
        r1 = self._create_recall()
        self.client.post(f'/api/v1/recall/{r1.data["id"]}/transition/', {
            'action': 'active', 'esig_password': 'Secret123!',
        })
        r2 = self._create_recall()  # stays 'initiated'

        response = self.client.get('/api/v1/recall/active/')
        self.assertEqual(response.status_code, 200)
        ids = [r['id'] for r in response.data]
        self.assertIn(r1.data['id'], ids)
        self.assertNotIn(r2.data['id'], ids)

    def test_closing_a_completed_recall_requires_esig(self):
        response = self._create_recall()
        recall_id = response.data['id']
        self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'active', 'esig_password': 'Secret123!'})
        self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'completed'})  # no esig needed
        close_response = self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'closed'})
        self.assertEqual(close_response.status_code, 400)

    def test_closing_a_completed_recall_with_esig_succeeds(self):
        response = self._create_recall()
        recall_id = response.data['id']
        self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'active', 'esig_password': 'Secret123!'})
        self.client.post(f'/api/v1/recall/{recall_id}/transition/', {'action': 'completed'})
        close_response = self.client.post(f'/api/v1/recall/{recall_id}/transition/', {
            'action': 'closed', 'esig_password': 'Secret123!',
        })
        self.assertEqual(close_response.status_code, 200)
        self.assertEqual(close_response.data['status'], 'closed')
