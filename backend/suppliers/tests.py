from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from shared.models import ESignature
from suppliers.models import ASLEntry, Supplier

User = get_user_model()


class SupplierModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='supqa', password='Secret123!')

    def test_supplier_code_auto_generated_with_sup_prefix(self):
        supplier = Supplier.objects.create(
            name='Acme Excipients Ltd',
            category='raw_material',
            country='India',
            created_by=self.user,
            modified_by=self.user,
        )
        self.assertTrue(supplier.supplier_code.startswith('SUP'))

    def test_history_recorded(self):
        supplier = Supplier.objects.create(
            name='Acme Excipients Ltd',
            category='raw_material',
            country='India',
            created_by=self.user,
            modified_by=self.user,
        )
        supplier.status = 'qualified'
        supplier.modified_by = self.user
        supplier.save()
        self.assertGreaterEqual(supplier.history.count(), 2)


class ASLEntrySingletonTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='aslapprover', password='Secret123!')
        self.esignature = ESignature.objects.create(
            user=self.user,
            password_hash='irrelevant-for-test',
            record_type='ASLEntry',
            record_id='n/a',
            action='approve',
        )

    def _make_asl(self, version, is_current):
        return ASLEntry.objects.create(
            version=version,
            effective_date=date(2026, 1, 1),
            approved_by=self.user,
            esignature=self.esignature,
            is_current=is_current,
            created_by=self.user,
            modified_by=self.user,
        )

    def test_second_current_entry_demotes_the_first(self):
        first = self._make_asl('1.0', is_current=True)
        second = self._make_asl('2.0', is_current=True)

        first.refresh_from_db()
        second.refresh_from_db()

        self.assertFalse(first.is_current)
        self.assertTrue(second.is_current)

    def test_non_current_entries_are_unaffected(self):
        current = self._make_asl('1.0', is_current=True)
        archived = self._make_asl('0.9', is_current=False)

        current.refresh_from_db()
        archived.refresh_from_db()

        self.assertTrue(current.is_current)
        self.assertFalse(archived.is_current)


class SupplierAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='supapi', password='Secret123!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.supplier = Supplier.objects.create(
            name='Acme Excipients Ltd',
            category='raw_material',
            country='India',
            status='pending',
            created_by=self.user,
            modified_by=self.user,
        )

    def test_expiring_endpoint_lists_qualified_supplier_near_expiry(self):
        self.supplier.status = 'qualified'
        self.supplier.expiry_date = date.today()
        self.supplier.save()
        response = self.client.get('/api/v1/suppliers/expiring/')
        self.assertEqual(response.status_code, 200)
        codes = [s['supplier_code'] for s in response.data['results']]
        self.assertIn(self.supplier.supplier_code, codes)

    def test_asl_endpoint_returns_404_when_no_current_asl(self):
        response = self.client.get('/api/v1/suppliers/asl/')
        self.assertEqual(response.status_code, 404)

    def test_qualifications_endpoint_creates_qualification_record(self):
        response = self.client.post(f'/api/v1/suppliers/{self.supplier.id}/qualifications/', {
            'qualification_type': 'Initial Audit',
            'start_date': '2026-01-01',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.supplier.qualifications.count(), 1)
