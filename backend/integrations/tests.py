from django.test import TestCase
from django.utils import timezone

from .adapters.factory import get_erp_adapter
from .adapters.stub import StubERPAdapter
from .adapters.sap import SAPAdapter
from .models import IntegrationConfig, IntegrationSyncLog


class ERPAdapterFactoryTests(TestCase):
    def test_returns_stub_adapter_when_no_active_config_exists(self):
        adapter = get_erp_adapter()
        self.assertIsInstance(adapter, StubERPAdapter)

    def test_returns_stub_adapter_when_active_config_is_inactive(self):
        IntegrationConfig.objects.create(
            system_type='sap', name='SAP Prod', is_active=False,
        )
        adapter = get_erp_adapter()
        self.assertIsInstance(adapter, StubERPAdapter)

    def test_returns_sap_adapter_when_sap_config_active(self):
        IntegrationConfig.objects.create(
            system_type='sap', name='SAP Prod', is_active=True,
        )
        adapter = get_erp_adapter()
        self.assertIsInstance(adapter, SAPAdapter)


class StubERPAdapterTests(TestCase):
    def test_get_material_master_returns_stub_source(self):
        adapter = StubERPAdapter()
        data = adapter.get_material_master('MAT-001')
        self.assertEqual(data['source'], 'stub')
        self.assertEqual(data['material_code'], 'MAT-001')

    def test_get_batch_info_returns_stub_source(self):
        adapter = StubERPAdapter()
        data = adapter.get_batch_info('B2026001')
        self.assertEqual(data['source'], 'stub')
        self.assertEqual(data['batch_number'], 'B2026001')

    def test_push_quality_hold_and_release_return_true(self):
        adapter = StubERPAdapter()
        self.assertTrue(adapter.push_quality_hold('B2026001', 'contamination'))
        self.assertTrue(adapter.push_batch_release('B2026001'))


class SAPAdapterTests(TestCase):
    def test_connect_raises_import_error_when_pyrfc_missing(self):
        adapter = SAPAdapter(config={})
        with self.assertRaises(ImportError) as ctx:
            adapter._connect()
        self.assertIn('pyrfc', str(ctx.exception))

    def test_get_material_master_propagates_import_error(self):
        adapter = SAPAdapter(config={})
        with self.assertRaises(ImportError):
            adapter.get_material_master('MAT-001')


class IntegrationSyncLogTests(TestCase):
    def test_delete_raises_not_implemented_error(self):
        config = IntegrationConfig.objects.create(system_type='generic_rest', name='REST Endpoint')
        log = IntegrationSyncLog.objects.create(
            config=config, direction='inbound', entity_type='material_master',
            status='success', records_synced=5, started_at=timezone.now(),
        )
        with self.assertRaises(NotImplementedError):
            log.delete()
