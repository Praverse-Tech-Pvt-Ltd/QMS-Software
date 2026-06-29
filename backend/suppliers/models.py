from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel, ESignature
from core.utils import generate_qms_id


class Supplier(BaseModel):
    CATEGORIES = [
        ('raw_material', 'Raw Material'),
        ('packaging', 'Packaging'),
        ('contract_mfg', 'Contract Manufacturer'),
        ('service', 'Service Provider'),
    ]
    STATUSES = [
        ('pending', 'Pending'),
        ('qualified', 'Qualified'),
        ('conditional', 'Conditional'),
        ('disqualified', 'Disqualified'),
        ('suspended', 'Suspended'),
    ]
    TRANSITIONS = {
        'pending': ['qualified', 'disqualified'],
        'qualified': ['conditional', 'suspended', 'disqualified'],
        'conditional': ['qualified', 'disqualified', 'suspended'],
        'suspended': ['qualified', 'disqualified'],
    }
    ESIG_REQUIRED_ACTIONS = ['qualified', 'disqualified']

    supplier_code = models.CharField(max_length=30, unique=True, blank=True)
    name = models.CharField(max_length=300)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    country = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUSES, default='pending')
    approved_materials = models.JSONField(default=list)
    qualification_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.supplier_code:
            self.supplier_code = generate_qms_id(Supplier, 'supplier_code', 'SUP')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.supplier_code} — {self.name}"

    class Meta:
        ordering = ['name']


class QualificationRecord(BaseModel):
    STATUSES = [
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    TRANSITIONS = {
        'in_progress': ['approved', 'rejected'],
    }
    ESIG_REQUIRED_ACTIONS = ['approved', 'rejected']

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='qualifications')
    qualification_type = models.CharField(max_length=100)
    start_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    qualified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='qualified_suppliers',
    )
    status = models.CharField(max_length=20, choices=STATUSES, default='in_progress')
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT, null=True, blank=True)
    notes = models.TextField(blank=True)

    history = HistoricalRecords()


class ASLEntry(BaseModel):
    """Approved Supplier List version. Only one can be is_current=True."""
    version = models.CharField(max_length=20)
    effective_date = models.DateField()
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='approved_asls',
    )
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT)
    is_current = models.BooleanField(default=False)
    suppliers = models.ManyToManyField(Supplier, related_name='asl_entries', blank=True)

    def save(self, *args, **kwargs):
        if self.is_current:
            ASLEntry.objects.filter(is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ASL v{self.version} ({'current' if self.is_current else 'archived'})"

    class Meta:
        ordering = ['-effective_date']


class Scorecard(BaseModel):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='scorecards')
    period = models.CharField(max_length=20, help_text='e.g. 2025-Q1')
    quality_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    delivery_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    responsiveness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    history = HistoricalRecords()


class SupplierChangeNotification(BaseModel):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='change_notifications')
    description = models.TextField()
    received_date = models.DateField()
    internal_review = models.TextField(blank=True)
    ai_remark = models.TextField(blank=True)
    status = models.CharField(max_length=30, default='open')

    history = HistoricalRecords()
