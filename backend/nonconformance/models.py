from django.db import models
from django.conf import settings
from django.utils import timezone
from simple_history.models import HistoricalRecords
from shared.models import BaseModel, ESignature
from core.utils import generate_qms_id


class NCReport(BaseModel):
    SEVERITIES = [
        ('critical', 'Critical'),
        ('major', 'Major'),
        ('minor', 'Minor'),
    ]
    STATUS = [
        ('open', 'Open'),
        ('dispositioned', 'Dispositioned'),
        ('closed', 'Closed'),
    ]
    TRANSITIONS = {
        'open': ['dispositioned'],
        'dispositioned': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['closed']

    nc_number = models.CharField(max_length=30, unique=True, blank=True)
    product = models.CharField(max_length=200)
    batch_lot = models.CharField(max_length=100)
    quantity_affected = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=20)
    defect_description = models.TextField()
    defect_category = models.CharField(max_length=100, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITIES, default='minor')
    hold_status = models.BooleanField(default=True)
    status = models.CharField(max_length=30, choices=STATUS, default='open')
    linked_capa = models.ForeignKey(
        'quality.Capa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nonconformances',
    )
    disposition = models.ForeignKey(
        'Disposition',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.nc_number:
            self.nc_number = generate_qms_id(NCReport, 'nc_number', 'NC')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nc_number} — {self.product} ({self.batch_lot})"

    class Meta:
        ordering = ['-created_at']


class HoldRecord(models.Model):
    nc = models.ForeignKey(NCReport, on_delete=models.CASCADE, related_name='holds')
    placed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='placed_holds',
    )
    placed_at = models.DateTimeField(default=timezone.now)
    released_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='released_holds',
    )
    released_at = models.DateTimeField(null=True, blank=True)
    reason = models.TextField()

    def __str__(self):
        return f"Hold on {self.nc.nc_number} placed {self.placed_at.date()}"


class Disposition(BaseModel):
    DECISIONS = [
        ('use_as_is', 'Use As-Is'),
        ('rework', 'Rework'),
        ('reject', 'Reject'),
        ('rtv', 'Return to Vendor'),
    ]

    nc = models.ForeignKey(NCReport, on_delete=models.CASCADE, related_name='dispositions')
    decision = models.CharField(max_length=20, choices=DECISIONS)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='dispositions',
    )
    decided_at = models.DateTimeField(default=timezone.now)
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT)
    justification = models.TextField()

    history = HistoricalRecords()

    def __str__(self):
        return f"Disposition: {self.decision} for {self.nc.nc_number}"
