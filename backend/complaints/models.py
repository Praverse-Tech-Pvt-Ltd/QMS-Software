from datetime import timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


class Complaint(BaseModel):
    COMPLAINANT_TYPES = [
        ('customer', 'Customer / Patient'),
        ('hcp', 'Healthcare Professional'),
        ('distributor', 'Distributor'),
        ('regulator', 'Regulatory Authority'),
        ('internal', 'Internal'),
    ]
    SEVERITIES = [
        ('critical', 'Critical'),
        ('major', 'Major'),
        ('minor', 'Minor'),
    ]
    STATUS = [
        ('new', 'New'),
        ('in_investigation', 'In Investigation'),
        ('pending_closure', 'Pending Closure'),
        ('closed', 'Closed'),
    ]
    TRANSITIONS = {
        'new': ['in_investigation'],
        'in_investigation': ['pending_closure'],
        'pending_closure': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['closed']

    complaint_number = models.CharField(max_length=30, unique=True, blank=True)
    received_date = models.DateField(default=timezone.localdate)
    complainant_type = models.CharField(max_length=20, choices=COMPLAINANT_TYPES)
    product = models.CharField(max_length=200)
    batch_lot = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITIES, default='minor')
    regulatory_reportable = models.BooleanField(default=False)
    response_deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS, default='new')
    linked_nc = models.ForeignKey(
        'nonconformance.NCReport',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints',
    )
    linked_capa = models.ForeignKey(
        'quality.Capa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints',
    )
    mdr_submission_date = models.DateField(null=True, blank=True)

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.complaint_number:
            self.complaint_number = generate_qms_id(Complaint, 'complaint_number', 'CMP')
        # Auto-calculate response_deadline
        if not self.response_deadline and self.received_date:
            days = 30 if self.severity == 'critical' else 45
            self.response_deadline = self.received_date + timedelta(days=days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.complaint_number} — {self.product}"

    class Meta:
        ordering = ['-received_date']


class Investigation(BaseModel):
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='investigation')
    investigator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='investigations',
    )
    findings = models.TextField(blank=True)
    root_cause = models.TextField(blank=True)
    conclusion = models.TextField(blank=True)
    completed_date = models.DateField(null=True, blank=True)

    history = HistoricalRecords()


class MDRReport(BaseModel):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='mdr_reports')
    report_number = models.CharField(max_length=50, blank=True)
    submitted_date = models.DateField(null=True, blank=True)
    regulatory_body = models.CharField(max_length=100, default='FDA')
    submission_notes = models.TextField(blank=True)

    history = HistoricalRecords()
