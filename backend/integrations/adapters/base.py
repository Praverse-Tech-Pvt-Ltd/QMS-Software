from abc import ABC, abstractmethod


class ERPAdapter(ABC):
    """
    Common interface every ERP integration (SAP, Oracle, generic REST, stub)
    must implement. Callers should always go through `get_erp_adapter()`
    (see factory.py) rather than instantiating an adapter directly, and
    should always wrap calls in try/except — ERP connectivity must never
    block or fail a QMS record creation flow.
    """

    @abstractmethod
    def get_material_master(self, material_code: str) -> dict:
        """Fetch material master data for a given material code."""
        ...

    @abstractmethod
    def get_batch_info(self, batch_number: str) -> dict:
        """Fetch batch/lot information for a given batch number."""
        ...

    @abstractmethod
    def push_quality_hold(self, batch_number: str, reason: str) -> bool:
        """Push a quality hold on a batch to the ERP system."""
        ...

    @abstractmethod
    def push_batch_release(self, batch_number: str) -> bool:
        """Push a batch release notification to the ERP system."""
        ...
