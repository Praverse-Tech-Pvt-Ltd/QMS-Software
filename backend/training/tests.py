from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from knowledge.models import SOPChunk
from training.models import TrainingAssignment, TrainingPlan

User = get_user_model()


class MyTasksTests(TestCase):
    """
    Regression tests for the previously-404 GET /api/training/assignments/my-tasks/
    endpoint (Phase 5 Block 2). TrainingAssignment uses `user` (not `assigned_to`)
    and status choices PENDING/COMPLETED/OVERDUE (not lowercase 'completed').
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst1', password='TestPass123!', role='QC')
        self.other_user = User.objects.create_user(username='analyst2', password='TestPass123!', role='QA')
        self.plan = TrainingPlan.objects.create(
            title='SOP-QA-001 Gowning Procedure', description='x',
            department='QC', trainer='QA', method='SOP',
        )

    def test_my_tasks_endpoint_returns_200(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/training/assignments/my-tasks/')
        self.assertEqual(response.status_code, 200)

    def test_my_tasks_returns_only_current_user_assignments(self):
        TrainingAssignment.objects.create(plan=self.plan, user=self.user, due_date='2026-12-01')
        TrainingAssignment.objects.create(plan=self.plan, user=self.other_user, due_date='2026-12-01')

        self.client.force_authenticate(self.user)
        response = self.client.get('/api/training/assignments/my-tasks/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.user.id)

    def test_my_tasks_excludes_completed(self):
        TrainingAssignment.objects.create(
            plan=self.plan, user=self.user, due_date='2026-12-01', status='PENDING',
        )
        TrainingAssignment.objects.create(
            plan=self.plan, user=self.user, due_date='2026-01-01', status='COMPLETED',
            completion_date='2026-01-02', score=100,
        )

        self.client.force_authenticate(self.user)
        response = self.client.get('/api/training/assignments/my-tasks/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'PENDING')

    def test_my_tasks_ordered_by_due_date_ascending(self):
        TrainingAssignment.objects.create(plan=self.plan, user=self.user, due_date='2026-12-31')
        TrainingAssignment.objects.create(plan=self.plan, user=self.user, due_date='2026-01-15')

        self.client.force_authenticate(self.user)
        response = self.client.get('/api/training/assignments/my-tasks/')
        due_dates = [item['due_date'] for item in response.data]
        self.assertEqual(due_dates, sorted(due_dates))

    def test_unauthenticated_returns_401(self):
        response = self.client.get('/api/training/assignments/my-tasks/')
        self.assertEqual(response.status_code, 401)


class QuizGenerationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='quizuser', password='Secret123!', role='QA')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.plan = TrainingPlan.objects.create(
            title='SOP-QA-004 Deviation Management Training',
            description='Covers the deviation management procedure',
            department='QA', trainer='QA', method='SOP',
        )
        self.assignment = TrainingAssignment.objects.create(
            plan=self.plan, user=self.user, due_date='2026-12-01',
        )

    def test_generate_quiz_without_indexed_sop_returns_400(self):
        response = self.client.post(f'/api/training/assignments/{self.assignment.id}/generate-quiz/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('not indexed', response.data['error'])

    def test_generate_quiz_with_indexed_sop_but_no_ai_key_returns_503(self):
        # Without ANTHROPIC_API_KEY, generate_quiz_from_sop() is in STUB_MODE and
        # returns [] — quiz generation degrades gracefully (never raises) but
        # cannot actually produce a quiz, so the endpoint reports 503.
        SOPChunk.objects.create(
            sop_name=self.plan.title,
            chunk_text='All deviations must be reported within 24 hours of discovery.',
            uploaded_by=self.user,
        )
        response = self.client.post(f'/api/training/assignments/{self.assignment.id}/generate-quiz/')
        self.assertEqual(response.status_code, 503)


class QuizSubmissionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='quizsubmit', password='Secret123!', role='QA')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.plan = TrainingPlan.objects.create(
            title='SOP-QA-004 Deviation Management Training',
            description='x', department='QA', trainer='QA', method='SOP',
        )
        self.assignment = TrainingAssignment.objects.create(
            plan=self.plan, user=self.user, due_date='2026-12-01',
            quiz_questions=[
                {'question': 'Q1?', 'options': ['A', 'B'], 'correct_index': 0},
                {'question': 'Q2?', 'options': ['A', 'B'], 'correct_index': 1},
                {'question': 'Q3?', 'options': ['A', 'B'], 'correct_index': 0},
                {'question': 'Q4?', 'options': ['A', 'B'], 'correct_index': 1},
                {'question': 'Q5?', 'options': ['A', 'B'], 'correct_index': 0},
            ],
        )

    def test_submit_quiz_without_generated_quiz_returns_400(self):
        empty_assignment = TrainingAssignment.objects.create(
            plan=self.plan, user=self.user, due_date='2026-12-01',
        )
        response = self.client.post(
            f'/api/training/assignments/{empty_assignment.id}/submit-quiz/', {'answers': [0]}, format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_submit_quiz_all_correct_passes_at_100_percent(self):
        response = self.client.post(
            f'/api/training/assignments/{self.assignment.id}/submit-quiz/',
            {'answers': [0, 1, 0, 1, 0]}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['score_percent'], 100.0)
        self.assertTrue(response.data['passed'])
        self.assignment.refresh_from_db()
        self.assertTrue(self.assignment.quiz_passed)

    def test_submit_quiz_4_of_5_correct_passes_at_80_percent(self):
        response = self.client.post(
            f'/api/training/assignments/{self.assignment.id}/submit-quiz/',
            {'answers': [0, 1, 0, 1, 1]}, format='json',  # last answer wrong
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['score_percent'], 80.0)
        self.assertTrue(response.data['passed'])

    def test_submit_quiz_below_80_percent_fails(self):
        response = self.client.post(
            f'/api/training/assignments/{self.assignment.id}/submit-quiz/',
            {'answers': [1, 0, 1, 0, 1]}, format='json',  # all wrong
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['score_percent'], 0.0)
        self.assertFalse(response.data['passed'])
        self.assignment.refresh_from_db()
        self.assertFalse(self.assignment.quiz_passed)

    def test_submit_quiz_returns_correct_flags_per_question(self):
        response = self.client.post(
            f'/api/training/assignments/{self.assignment.id}/submit-quiz/',
            {'answers': [0, 1, 1, 1, 0]}, format='json',  # question 3 (index 2) wrong
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['correct'], [True, True, False, True, True])
