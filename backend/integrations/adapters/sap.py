from .base import ERPAdapter


class SAPAdapter(ERPAdapter):
    """
    SAP ERP adapter via BAPI/RFC calls. Requires `pyrfc` and the SAP NWRFC
    SDK to be installed — neither is bundled with this project, so
    `_connect()` raises a clear ImportError until an operator provisions
    them. Until then, method bodies below return placeholder, stub-shaped
    data so callers can be developed/tested against a stable contract.
    """

    def __init__(self, config: dict):
        self.config = config

    def _connect(self):
        try:
            import pyrfc  # noqa: F401
        except ImportError:
            raise ImportError(
                "SAP integration requires pyrfc and the SAP NWRFC SDK. "
                "Install with: pip install pyrfc (requires SAP NWRFC SDK — "
                "see https://support.sap.com). Falling back is the caller's "
                "responsibility."
            )

    def get_material_master(self, material_code):
        self._connect()
        # Placeholder BAPI call — returns stub-shaped data until a real SAP
        # connection is configured.
        return {
            'material_code': material_code,
            'description': 'SAP material (placeholder)',
            'uom': 'KG',
            'source': 'sap_placeholder',
        }

    def get_batch_info(self, batch_number):
        self._connect()
        return {
            'batch_number': batch_number,
            'status': 'released',
            'source': 'sap_placeholder',
        }

    def push_quality_hold(self, batch_number, reason):
        self._connect()
        return True

    def push_batch_release(self, batch_number):
        self._connect()
        return True
