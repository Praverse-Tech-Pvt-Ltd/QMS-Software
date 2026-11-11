from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from . import mbr_generator, regulatory_triggers
from .stage_library import LIBRARY

User = get_user_model()


class SkeletonTests(SimpleTestCase):
    def test_all_forms_start_with_line_clearance_and_end_with_review(self):
        for form in LIBRARY:
            sk = mbr_generator.build_skeleton('P', form, '100 kg')
            keys = [s['stage_key'] for s in sk['steps']]
            self.assertEqual(keys[0], 'line_clearance', form)
            self.assertEqual(keys[-1], 'batch_review', form)
            self.assertIn('yield_reconciliation', keys)
            self.assertEqual([s['step_number'] for s in sk['steps']], list(range(1, len(keys) + 1)))

    def test_critical_steps_require_esig(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', '1 lakh tabs')
        self.assertTrue(all(s['esig_required'] for s in sk['steps'] if s['is_critical']))

    def test_unknown_form_raises(self):
        with self.assertRaises(mbr_generator.UnknownDosageForm):
            mbr_generator.build_skeleton('P', 'nonsense')

    def test_excluding_stage_adds_warning_and_renumbers(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', 'x', excluded_stage_keys=['coating'])
        self.assertNotIn('coating', [s['stage_key'] for s in sk['steps']])
        self.assertTrue(any('coating' in w.lower() or 'Coating' in w for w in sk['warnings']))

    def test_no_limits_are_invented(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', 'x')
        self.assertTrue(all(s['expected_range'] == '' for s in sk['steps']))

    def test_user_limits_are_carried_through(self):
        sk = mbr_generator.build_skeleton(
            'P', 'oral_solid_tablet', 'x', parameters={'compression': {'expected_range': '95.0-105.0'}})
        comp = next(s for s in sk['steps'] if s['stage_key'] == 'compression')
        self.assertEqual(comp['expected_range'], '95.0-105.0')


class ValidationTests(SimpleTestCase):
    def test_missing_yield_and_batch_size_block(self):
        sk = mbr_generator.build_skeleton('P', 'api_synthesis', '')
        res = mbr_generator.validate_skeleton(sk, None, '')
        self.assertTrue(any('Batch size' in b for b in res['blocking']))
        self.assertTrue(any('Theoretical yield' in b for b in res['blocking']))
        self.assertTrue(any('formula' in b for b in res['blocking']))

    def test_complete_mbr_has_no_blocking_but_ipqc_advisory(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', '100 kg')
        res = mbr_generator.validate_skeleton(sk, 100, 'actual/theoretical*100')
        self.assertEqual(res['blocking'], [])
        self.assertTrue(res['advisory'])

    def test_removed_mandatory_stage_blocks(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', '100 kg')
        sk['steps'] = [s for s in sk['steps'] if s['stage_key'] != 'line_clearance']
        res = mbr_generator.validate_skeleton(sk, 100, 'f')
        self.assertTrue(any('line_clearance' in b for b in res['blocking']))

    def test_critical_without_esig_blocks(self):
        sk = mbr_generator.build_skeleton('P', 'oral_solid_tablet', '100 kg')
        next(s for s in sk['steps'] if s['is_critical'])['esig_required'] = False
        res = mbr_generator.validate_skeleton(sk, 100, 'f')
        self.assertTrue(any('e-signature' in b for b in res['blocking']))


class TriggerTests(SimpleTestCase):
    def test_site_change_flags_high(self):
        res = regulatory_triggers.evaluate({'site_change': True})
        self.assertEqual(res['triggers'][0]['id'], 'RT-001')
        self.assertIn('Regulatory Affairs to confirm', res['triggers'][0]['disposition'])

    def test_like_for_like_equipment_is_low(self):
        res = regulatory_triggers.evaluate({
            'change_type': 'equipment', 'equipment_different_principle': False, 'affects_registered_process': True})
        self.assertEqual([t['id'] for t in res['triggers']], ['RT-003'])

    def test_no_facts_no_triggers(self):
        self.assertEqual(regulatory_triggers.evaluate({})['triggers'], [])

    def test_sorted_high_first(self):
        res = regulatory_triggers.evaluate({'spec_tightened': True, 'spec_loosened': True})
        self.assertEqual([t['risk'] for t in res['triggers']], ['high', 'medium'])

    def test_ruleset_flagged_unreviewed(self):
        self.assertFalse(regulatory_triggers.evaluate({})['status']['expert_reviewed'])


class DocStudioAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dsuser', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_requires_auth(self):
        anon = APIClient()
        self.assertIn(anon.get('/api/v1/docstudio/stage-library/').status_code, (401, 403))

    def test_stage_library_lists_forms(self):
        r = self.client.get('/api/v1/docstudio/stage-library/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data['forms']), len(LIBRARY))

    def test_skeleton_endpoint(self):
        r = self.client.post('/api/v1/docstudio/mbr/skeleton/', {
            'product': 'Metformin 500 mg', 'dosage_form': 'oral_solid_tablet', 'batch_size': '200 kg'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('blocking', r.data['validation'])

    def test_create_blocked_when_incomplete(self):
        r = self.client.post('/api/v1/docstudio/mbr/create/', {
            'product': 'X', 'dosage_form': 'oral_solid_tablet', 'version': '1.0'}, format='json')
        self.assertEqual(r.status_code, 422)

    def test_create_persists_draft_mbr_and_rejects_duplicate(self):
        payload = {'product': 'Metformin 500 mg', 'dosage_form': 'oral_solid_tablet', 'version': '1.0',
                   'batch_size': '200 kg', 'theoretical_yield': 200, 'yield_formula': 'actual/theoretical*100'}
        r = self.client.post('/api/v1/docstudio/mbr/create/', payload, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        from batch_records.models import MasterBatchRecord
        mbr = MasterBatchRecord.objects.get(product='Metformin 500 mg', version='1.0')
        self.assertEqual(mbr.status, 'draft')
        self.assertEqual(mbr.steps.count(), r.data['steps'])
        self.assertEqual(self.client.post('/api/v1/docstudio/mbr/create/', payload, format='json').status_code, 409)

    def test_triggers_endpoint(self):
        r = self.client.post('/api/v1/docstudio/regulatory-triggers/', {'site_change': True}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['triggers'][0]['id'], 'RT-001')
