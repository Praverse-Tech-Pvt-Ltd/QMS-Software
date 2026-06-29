from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from risk.models import Risk, ResidualRisk

User = get_user_model()


class RiskModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='riskowner', password='Secret123!')

    def _make_risk(self, severity=3, occurrence=3, detection=3, **overrides):
        defaults = dict(
            category='process',
            description='Filling line speed variance',
            potential_effect='Underfill risk',
            severity=severity,
            occurrence=occurrence,
            detection=detection,
            owner=self.user,
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return Risk.objects.create(**defaults)

    def test_rpn_equals_severity_times_occurrence_times_detection(self):
        risk = self._make_risk(severity=4, occurrence=3, detection=2)
        self.assertEqual(risk.rpn, 24)

    def test_rpn_is_not_a_database_field(self):
        field_names = [f.name for f in Risk._meta.get_fields()]
        self.assertNotIn('rpn', field_names)

    def test_risk_level_low_below_25(self):
        risk = self._make_risk(severity=2, occurrence=2, detection=2)  # rpn=8
        self.assertEqual(risk.risk_level, 'Low')

    def test_risk_level_medium_between_25_and_49(self):
        risk = self._make_risk(severity=3, occurrence=3, detection=3)  # rpn=27
        self.assertEqual(risk.risk_level, 'Medium')

    def test_risk_level_high_between_50_and_74(self):
        risk = self._make_risk(severity=4, occurrence=4, detection=4)  # rpn=64
        self.assertEqual(risk.risk_level, 'High')

    def test_risk_level_critical_75_or_above(self):
        risk = self._make_risk(severity=5, occurrence=5, detection=5)  # rpn=125
        self.assertEqual(risk.risk_level, 'Critical')

    def test_risk_id_auto_generated_with_rsk_prefix(self):
        risk = self._make_risk()
        self.assertTrue(risk.risk_id.startswith('RSK'))

    def test_history_recorded_on_change(self):
        risk = self._make_risk()
        risk.status = 'mitigated'
        risk.modified_by = self.user
        risk.save()
        self.assertGreaterEqual(risk.history.count(), 2)


class ResidualRiskModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='assessor', password='Secret123!')
        self.risk = Risk.objects.create(
            category='process',
            description='Filling line speed variance',
            potential_effect='Underfill risk',
            severity=4,
            occurrence=4,
            detection=4,
            owner=self.user,
            created_by=self.user,
            modified_by=self.user,
        )

    def test_residual_rpn_computes_correctly(self):
        residual = ResidualRisk.objects.create(
            risk=self.risk,
            residual_severity=2,
            residual_occurrence=2,
            residual_detection=2,
            assessed_by=self.user,
        )
        self.assertEqual(residual.residual_rpn, 8)


class RiskAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='riskapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.risk = Risk.objects.create(
            category='process',
            description='Filling line speed variance',
            potential_effect='Underfill risk',
            severity=4,
            occurrence=4,
            detection=4,
            owner=self.user,
            created_by=self.user,
            modified_by=self.user,
        )

    def test_matrix_endpoint_counts_open_risk_in_correct_cell(self):
        response = self.client.get('/api/v1/risks/matrix/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['matrix'][3][3], 1)
        self.assertEqual(response.data['total'], 1)

    def test_mitigate_endpoint_creates_mitigation(self):
        response = self.client.post(f'/api/v1/risks/{self.risk.id}/mitigate/', {
            'description': 'Install additional inline sensor',
            'action_owner': self.user.id,
            'due_date': '2026-12-01',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.risk.mitigations.count(), 1)

    def test_reassess_endpoint_creates_residual_risk(self):
        response = self.client.post(f'/api/v1/risks/{self.risk.id}/reassess/', {
            'residual_severity': 2,
            'residual_occurrence': 2,
            'residual_detection': 2,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['residual_rpn'], 8)
        self.assertTrue(response.data['created'])

    def test_transition_endpoint_moves_status(self):
        response = self.client.post(f'/api/v1/risks/{self.risk.id}/transition/', {'action': 'mitigated'})
        self.assertEqual(response.status_code, 200)
        self.risk.refresh_from_db()
        self.assertEqual(self.risk.status, 'mitigated')
