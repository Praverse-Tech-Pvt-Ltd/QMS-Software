from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import InventoryCategory, InventoryItem, InventoryLot, InventoryUsageLog
from .tasks import alert_low_stock

User = get_user_model()


class InventoryModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='invqa', password='Secret123!', email='invqa@example.com')
        self.category = InventoryCategory.objects.create(name='Reagent')

    def _make_item(self, **overrides):
        defaults = dict(
            item_code='ITM-001',
            name='Sodium Chloride',
            category=self.category,
            unit='g',
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return InventoryItem.objects.create(**defaults)

    def _make_lot(self, item=None, **overrides):
        defaults = dict(
            item=item or self._make_item(),
            lot_number='LOT-001',
            received_date=date(2026, 1, 1),
            initial_quantity=Decimal('100.000'),
            current_quantity=Decimal('100.000'),
            created_by=self.user,
            modified_by=self.user,
        )
        defaults.update(overrides)
        return InventoryLot.objects.create(**defaults)

    def test_category_str(self):
        self.assertEqual(str(self.category), 'Reagent')

    def test_usage_log_save_deducts_from_lot_current_quantity(self):
        lot = self._make_lot()
        InventoryUsageLog.objects.create(
            lot=lot, quantity_used=Decimal('30.000'), used_by=self.user,
            used_date=date(2026, 1, 5), purpose='Assay prep',
            created_by=self.user, modified_by=self.user,
        )
        lot.refresh_from_db()
        self.assertEqual(lot.current_quantity, Decimal('70.000'))
        self.assertEqual(lot.status, 'in_use')

    def test_usage_log_save_marks_lot_consumed_when_exhausted(self):
        lot = self._make_lot(current_quantity=Decimal('10.000'))
        InventoryUsageLog.objects.create(
            lot=lot, quantity_used=Decimal('10.000'), used_by=self.user,
            used_date=date(2026, 1, 5), purpose='Final use',
            created_by=self.user, modified_by=self.user,
        )
        lot.refresh_from_db()
        self.assertEqual(lot.status, 'consumed')
        self.assertEqual(lot.current_quantity, Decimal('0.000'))

    def test_usage_log_save_does_not_drive_quantity_negative(self):
        lot = self._make_lot(current_quantity=Decimal('5.000'))
        InventoryUsageLog.objects.create(
            lot=lot, quantity_used=Decimal('12.000'), used_by=self.user,
            used_date=date(2026, 1, 5), purpose='Overuse',
            created_by=self.user, modified_by=self.user,
        )
        lot.refresh_from_db()
        self.assertEqual(lot.current_quantity, Decimal('0.000'))
        self.assertEqual(lot.status, 'consumed')

    def test_item_delete_raises_not_implemented_error(self):
        item = self._make_item()
        with self.assertRaises(NotImplementedError):
            item.delete()

    def test_lot_delete_raises_not_implemented_error(self):
        lot = self._make_lot()
        with self.assertRaises(NotImplementedError):
            lot.delete()

    def test_alert_low_stock_finds_items_below_minimum(self):
        item = self._make_item(item_code='ITM-002', minimum_stock=Decimal('50.000'))
        self._make_lot(item=item, lot_number='LOT-LOW', current_quantity=Decimal('10.000'))
        result = alert_low_stock()
        self.assertIn('Checked', result)
        self.assertIn('1 low-stock', result)

    def test_alert_low_stock_skips_items_at_or_above_minimum(self):
        item = self._make_item(item_code='ITM-003', minimum_stock=Decimal('50.000'))
        self._make_lot(item=item, lot_number='LOT-OK', current_quantity=Decimal('100.000'))
        result = alert_low_stock()
        self.assertIn('0 low-stock', result)


class InventoryAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='invapi', password='Secret123!', email='invapi@example.com')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.category = InventoryCategory.objects.create(name='Column')

    def _create_item(self, **overrides):
        payload = {
            'item_code': 'API-ITM-001',
            'name': 'HPLC Column',
            'category': str(self.category.id),
            'unit': 'ea',
        }
        payload.update(overrides)
        return self.client.post('/api/v1/inventory/items/', payload, format='json')

    def _create_lot(self, item_id, **overrides):
        payload = {
            'item': item_id,
            'lot_number': 'API-LOT-001',
            'received_date': '2026-01-01',
            'initial_quantity': '50.000',
        }
        payload.update(overrides)
        return self.client.post('/api/v1/inventory/lots/', payload, format='json')

    def test_create_item(self):
        response = self._create_item()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['item_code'], 'API-ITM-001')

    def test_create_lot_defaults_current_quantity_to_initial(self):
        item_resp = self._create_item()
        lot_resp = self._create_lot(item_resp.data['id'])
        self.assertEqual(lot_resp.status_code, 201)
        self.assertEqual(lot_resp.data['current_quantity'], '50.000')

    def test_record_usage_via_nested_action_deducts_quantity(self):
        item_resp = self._create_item()
        lot_resp = self._create_lot(item_resp.data['id'])
        lot_id = lot_resp.data['id']

        usage_resp = self.client.post(f'/api/v1/inventory/lots/{lot_id}/usage/', {
            'quantity_used': '20.000',
            'used_date': '2026-01-10',
            'purpose': 'Column conditioning',
        }, format='json')
        self.assertEqual(usage_resp.status_code, 201)

        lot = InventoryLot.objects.get(id=lot_id)
        self.assertEqual(lot.current_quantity, Decimal('30.000'))
        self.assertEqual(lot.usage_logs.count(), 1)
        self.assertEqual(lot.usage_logs.first().used_by, self.user)

    def test_usage_action_get_lists_logs_for_lot(self):
        item_resp = self._create_item()
        lot_resp = self._create_lot(item_resp.data['id'])
        lot_id = lot_resp.data['id']
        self.client.post(f'/api/v1/inventory/lots/{lot_id}/usage/', {
            'quantity_used': '5.000', 'used_date': '2026-01-10', 'purpose': 'Test',
        }, format='json')

        list_resp = self.client.get(f'/api/v1/inventory/lots/{lot_id}/usage/')
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data), 1)

    def test_lots_expiring_endpoint_filters_within_30_days(self):
        item_resp = self._create_item()
        near_resp = self._create_lot(
            item_resp.data['id'], lot_number='LOT-NEAR',
            expiry_date=str(date.today() + timedelta(days=10)),
        )
        far_resp = self._create_lot(
            item_resp.data['id'], lot_number='LOT-FAR',
            expiry_date=str(date.today() + timedelta(days=365)),
        )

        response = self.client.get('/api/v1/inventory/lots/expiring/')
        self.assertEqual(response.status_code, 200)
        ids = [r['id'] for r in response.data]
        self.assertIn(near_resp.data['id'], ids)
        self.assertNotIn(far_resp.data['id'], ids)

    def test_items_low_stock_endpoint(self):
        item_resp = self._create_item(item_code='API-ITM-LOW', minimum_stock='100.000')
        self._create_lot(item_resp.data['id'], initial_quantity='10.000')

        response = self.client.get('/api/v1/inventory/items/low-stock/')
        self.assertEqual(response.status_code, 200)
        codes = [r['item_code'] for r in response.data]
        self.assertIn('API-ITM-LOW', codes)

    def test_create_category(self):
        response = self.client.post('/api/v1/inventory/categories/', {'name': 'Culture Media'}, format='json')
        self.assertEqual(response.status_code, 201)
