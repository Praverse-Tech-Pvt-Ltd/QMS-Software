from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Document, add_months

User = get_user_model()


class AddMonthsTests(TestCase):
    def test_add_months_handles_year_rollover(self):
        self.assertEqual(add_months(date(2026, 11, 15), 3), date(2027, 2, 15))


class DocumentReviewModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dmsqa', password='Secret123!')

    def _make_document(self, **overrides):
        defaults = dict(title='Deviation Management SOP', doc_type='SOP', department='QA', owner=self.user)
        defaults.update(overrides)
        return Document.objects.create(**defaults)

    def test_next_review_date_unset_while_draft(self):
        doc = self._make_document(status=Document.Status.DRAFT)
        self.assertIsNone(doc.next_review_date)

    def test_next_review_date_set_when_effective(self):
        doc = self._make_document(status=Document.Status.EFFECTIVE, review_frequency_months=24)
        expected = add_months(date.today(), 24)
        self.assertEqual(doc.next_review_date, expected)

    def test_next_review_date_not_recomputed_once_set(self):
        doc = self._make_document(status=Document.Status.EFFECTIVE)
        original = doc.next_review_date
        doc.title = 'Updated title'
        doc.save()
        doc.refresh_from_db()
        self.assertEqual(doc.next_review_date, original)

    def test_mark_reviewed_resets_dates(self):
        doc = self._make_document(status=Document.Status.EFFECTIVE, review_frequency_months=12)
        doc.mark_reviewed()
        doc.refresh_from_db()
        self.assertEqual(doc.last_review_date, date.today())
        self.assertEqual(doc.next_review_date, add_months(date.today(), 12))


class DocumentReviewAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='dmsapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_review_due_endpoint_filters_effective_documents_within_30_days(self):
        due_soon = Document.objects.create(
            title='Due Soon SOP', doc_type='SOP', department='QA', owner=self.user,
            status=Document.Status.EFFECTIVE,
        )
        due_soon.next_review_date = date.today() + timedelta(days=10)
        due_soon.save()

        not_due = Document.objects.create(
            title='Not Due SOP', doc_type='SOP', department='QA', owner=self.user,
            status=Document.Status.EFFECTIVE,
        )
        not_due.next_review_date = date.today() + timedelta(days=400)
        not_due.save()

        Document.objects.create(
            title='Draft SOP', doc_type='SOP', department='QA', owner=self.user,
            status=Document.Status.DRAFT,
        )

        response = self.client.get('/api/dms/documents/review-due/')
        self.assertEqual(response.status_code, 200)
        ids = [d['document_id'] for d in response.data]
        self.assertIn(due_soon.document_id, ids)
        self.assertNotIn(not_due.document_id, ids)

    def test_mark_reviewed_endpoint(self):
        doc = Document.objects.create(
            title='SOP', doc_type='SOP', department='QA', owner=self.user,
            status=Document.Status.EFFECTIVE,
        )
        response = self.client.post(f'/api/dms/documents/{doc.document_id}/mark-reviewed/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['last_review_date'], date.today().isoformat())
