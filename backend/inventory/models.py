from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel


class InventoryCategory(models.Model):
    """
    Plain lookup table (not a regulated record) — e.g. "Reference Standard",
    "Reagent", "Culture Media", "Column", "Consumable".
    """
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Inventory Categories'

    def __str__(self):
        return self.name


class InventoryItem(BaseModel):
    """Master inventory item record — the catalog entry for a stocked material/reagent."""
    item_code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(InventoryCategory, on_delete=models.PROTECT, related_name='items')
    manufacturer = models.CharField(max_length=200, blank=True)
    catalog_no = models.CharField(max_length=100, blank=True)
    storage_condition = models.CharField(max_length=100, blank=True)
    unit = models.CharField(max_length=50)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.item_code} — {self.name}"

    class Meta:
        ordering = ['name']


class InventoryLot(BaseModel):
    """A single received lot/batch of an InventoryItem, tracked from receipt to consumption."""
    STATUS = [
        ('in_use', 'In Use'),
        ('quarantine', 'Quarantine'),
        ('expired', 'Expired'),
        ('consumed', 'Consumed'),
    ]

    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='lots')
    lot_number = models.CharField(max_length=100)
    received_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    initial_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    current_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    purity_percent = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='in_use')
    linked_coa = models.FileField(upload_to='inventory_coa/%Y/%m/', null=True, blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.item.item_code} — Lot {self.lot_number}"

    class Meta:
        ordering = ['-received_date']


class InventoryUsageLog(BaseModel):
    """
    A single withdrawal/consumption event against an InventoryLot. Saving a usage
    log deducts the used quantity from the parent lot's current_quantity and
    marks the lot 'consumed' once it's exhausted.
    """
    lot = models.ForeignKey(InventoryLot, on_delete=models.PROTECT, related_name='usage_logs')
    quantity_used = models.DecimalField(max_digits=10, decimal_places=3)
    used_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    used_date = models.DateField()
    purpose = models.CharField(max_length=200)
    linked_sample = models.ForeignKey(
        'laboratory.Sample', on_delete=models.SET_NULL, null=True, blank=True,
    )

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.lot} — {self.quantity_used} used by {self.used_by}"

    class Meta:
        ordering = ['-used_date']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        lot = self.lot
        lot.current_quantity -= self.quantity_used
        if lot.current_quantity <= 0:
            lot.status = 'consumed'
            lot.current_quantity = 0
        lot.save(update_fields=['current_quantity', 'status'])
