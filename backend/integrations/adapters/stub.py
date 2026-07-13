from .base import ERPAdapter


class StubERPAdapter(ERPAdapter):
    """
    No-op adapter used when no ERP integration is configured/active. Returns
    plausible-shaped fixture data so frontend pre-fill flows have something
    to render during development and demos.
    """

    def get_material_master(self, material_code):
        return {
            'material_code': material_code,
            'description': 'Stub material',
            'uom': 'KG',
            'source': 'stub',
        }

    def get_batch_info(self, batch_number):
        return {
            'batch_number': batch_number,
            'status': 'released',
            'source': 'stub',
        }

    def push_quality_hold(self, batch_number, reason):
        return True

    def push_batch_release(self, batch_number):
        return True
