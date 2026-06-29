from django.test import SimpleTestCase

from shared.ai.classifier import classify_event
from shared.ai.risk_scorer import score_risk
from shared.ai.questionnaire import get_next_questions
from shared.ai.action_extractor import extract_actions
from shared.ai.remark_generator import generate_remark


class ClassifierTests(SimpleTestCase):
    def test_change_control_keywords_classify_as_change_control(self):
        result = classify_event("Replace HPLC column as part of a change control")
        self.assertEqual(result['event_type'], 'change_control')

    def test_oos_keywords_classify_as_oos(self):
        result = classify_event("Test result outside specification for assay")
        self.assertEqual(result['event_type'], 'oos')

    def test_complaint_keywords_classify_as_complaint(self):
        result = classify_event("Customer complaint about particle contamination")
        self.assertEqual(result['event_type'], 'complaint')

    def test_empty_string_does_not_raise(self):
        result = classify_event("")
        self.assertIsInstance(result, dict)
        self.assertIn('event_type', result)

    def test_result_always_has_required_keys(self):
        result = classify_event("some unrelated text about lunch plans")
        self.assertIn('event_type', result)
        self.assertIn('sub_category', result)
        # NOTE: the classifier returns 'risk_level', not 'initial_risk_level'.
        self.assertIn('risk_level', result)


class RiskScorerTests(SimpleTestCase):
    def test_returns_score_level_and_approval_chain(self):
        result = score_risk('change_control', {})
        self.assertIn('score', result)
        self.assertIn('level', result)
        self.assertIn('approval_chain', result)

    def test_score_is_between_0_and_100(self):
        result = score_risk('complaint', {'serious_adr': 'Yes', 'complaint_nature': 'Adverse drug reaction'})
        self.assertGreaterEqual(result['score'], 0)
        self.assertLessEqual(result['score'], 100)

    def test_all_low_risk_answers_score_low(self):
        result = score_risk('complaint', {
            'serious_adr': 'No',
            'complaint_nature': 'Delivery / supply issue',
            'repeat_complaint': 'No',
        })
        self.assertEqual(result['level'], 'Low')

    def test_all_high_risk_answers_score_high_or_critical(self):
        result = score_risk('complaint', {
            'serious_adr': 'Yes',
            'complaint_nature': 'Adverse drug reaction',
            'repeat_complaint': 'Yes',
        })
        self.assertIn(result['level'], ('High', 'Critical'))

    def test_risk_module_uses_fmea_severity_occurrence_detection(self):
        # risk module reads q3 (severity), q4 (occurrence), q5 (detection) directly
        result = score_risk('risk', {'q3': 5, 'q4': 5, 'q5': 5})
        self.assertEqual(result['score'], 100)
        self.assertEqual(result['level'], 'Critical')


class QuestionnaireTests(SimpleTestCase):
    def test_no_answers_returns_first_question_not_complete(self):
        result = get_next_questions('change_control', 'change_control', {})
        self.assertFalse(result['complete'])
        self.assertGreaterEqual(len(result['next_questions']), 1)
        self.assertEqual(result['next_questions'][0]['id'], 'q1')

    def test_all_questions_answered_returns_complete(self):
        # deviation.json's questions are all choice/text (no multi_select), so a plain
        # string-keyed answers dict can walk the full chain including the q4 branch.
        all_answers = {
            'q1': 'Equipment failure',
            'q2': 'Pump seal degraded mid-batch',
            'q3': 'No - contained',
            'q4': 'No',
            'q5': 'No prior occurrence',
            'q6': 'Low',
        }
        result = get_next_questions('deviation', 'deviation', all_answers)
        self.assertTrue(result['complete'])
        self.assertEqual(result['next_questions'], [])

    def test_change_control_with_multi_select_answer_does_not_crash(self):
        """
        Regression test for TypeError: unhashable type: 'list'.
        change_control.json's q5 and q6 are multi_select questions — a list-typed
        answer used to crash get_next_questions() when the branch-matching loop
        ran `answer_value in branches` on a list. Walking past q5/q6 with list
        answers must now succeed (and ultimately reach completion).
        """
        answers = {
            'q1': 'Equipment / Instrument',
            'q2': 'Replace aging pump',
            'q3': 'No',
            'q4': 'No',
            'q5': ['Production', 'Quality Assurance'],  # multi_select answer
            'q6': ['None required'],                     # multi_select answer
            'q7': 'No',
            'q8': '2026-09-01',
        }
        result = get_next_questions('change_control', 'change_control', answers)
        self.assertTrue(result['complete'])
        self.assertEqual(result['next_questions'], [])

    def test_change_control_multi_select_answer_mid_walk_does_not_crash(self):
        """Same regression, but stopping partway through (q5 answered, q6 not yet)."""
        answers = {
            'q1': 'Equipment / Instrument',
            'q2': 'Replace aging pump',
            'q3': 'No',
            'q4': 'No',
            'q5': ['Production'],
        }
        result = get_next_questions('change_control', 'change_control', answers)
        self.assertFalse(result['complete'])
        self.assertEqual(result['next_questions'][0]['id'], 'q6')

    def test_nonexistent_module_raises_value_error(self):
        # No question_trees/nonexistent_module.json exists — _load_tree raises ValueError.
        # (The questionnaire engine does not currently degrade gracefully for unknown modules.)
        with self.assertRaises(ValueError):
            get_next_questions('nonexistent_module', 'nonexistent_module', {})


class ActionExtractorTests(SimpleTestCase):
    def test_training_sentence_extracts_training_category(self):
        results = extract_actions(["All analysts must be trained before use."])
        self.assertGreaterEqual(len(results), 1)
        self.assertTrue(any(a['category'] == 'training' for a in results))

    def test_empty_list_returns_empty_list(self):
        self.assertEqual(extract_actions([]), [])

    def test_each_action_has_required_keys(self):
        results = extract_actions(["Document the new process in the batch record."])
        self.assertGreaterEqual(len(results), 1)
        for action in results:
            self.assertIn('action', action)
            self.assertIn('category', action)
            self.assertIn('suggested_owner_role', action)
            self.assertIn('suggested_due_date', action)


class RemarkGeneratorTests(SimpleTestCase):
    """
    Without ANTHROPIC_API_KEY set, generate_remark() runs in STUB_MODE — this is the
    "AI never blocks" non-negotiable in practice: no network call, no exception, always
    a usable remark.
    """

    def test_returns_remark_draft_citations_and_risk_flags(self):
        result = generate_remark(
            module='capa', record_id='CAPA-001', approver_role='qa_manager', stage='approval',
        )
        self.assertIn('remark_draft', result)
        self.assertIn('sop_citations', result)
        self.assertIn('risk_flags', result)
        self.assertIn('CAPA-001', result['remark_draft'])

    def test_unknown_module_falls_back_to_general_sop(self):
        result = generate_remark(
            module='unknown_module', record_id='X-1', approver_role='qa', stage='review',
        )
        self.assertIn('SOP-QA-000', result['sop_citations'][0])

    def test_critical_risk_level_adds_fda_483_warning_flag(self):
        result = generate_remark(
            module='deviation', record_id='DEV-001', approver_role='qa_head', stage='closure',
            risk_level='Critical',
        )
        self.assertTrue(any('Warning Letter' in flag for flag in result['risk_flags']))

    def test_low_risk_level_has_no_risk_flags_by_default(self):
        result = generate_remark(
            module='deviation', record_id='DEV-002', approver_role='qa_head', stage='closure',
            risk_level='Low',
        )
        self.assertEqual(result['risk_flags'], [])

    def test_fda_risk_flags_are_passed_through(self):
        result = generate_remark(
            module='complaint', record_id='CMP-001', approver_role='qa_manager', stage='review',
            risk_level='Medium', fda_risk_flags=['Prior warning letter for similar defect'],
        )
        self.assertIn('Prior warning letter for similar defect', result['risk_flags'])
