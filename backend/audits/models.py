from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


class Audit(BaseModel):
    TYPES = [
        ('internal', 'Internal'),
        ('external', 'External'),
        ('supplier', 'Supplier'),
    ]
    STATUS = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]
    TRANSITIONS = {
        'planned': ['in_progress'],
        'in_progress': ['completed'],
        'completed': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['closed']

    audit_number = models.CharField(max_length=30, unique=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPES, default='internal')
    scope = models.TextField()
    lead_auditor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='led_audits',
    )
    co_auditors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='co_audited_audits',
        blank=True,
    )
    auditee_department = models.CharField(max_length=200)
    criteria = models.JSONField(default=list, help_text='List of regulatory standards/criteria')
    scheduled_date = models.DateField(null=True, blank=True)
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS, default='planned')
    closure_remark = models.TextField(blank=True)

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.audit_number:
            self.audit_number = generate_qms_id(Audit, 'audit_number', 'AUD')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.audit_number} — {self.type} audit"

    class Meta:
        ordering = ['-created_at']


class Finding(BaseModel):
    SEVERITIES = [
        ('critical', 'Critical'),
        ('major', 'Major'),
        ('minor', 'Minor'),
        ('observation', 'Observation'),
    ]
    STATUSES = [
        ('open', 'Open'),
        ('response_pending', 'Response Pending'),
        ('closed', 'Closed'),
    ]
    TRANSITIONS = {
        'open': ['response_pending'],
        'response_pending': ['closed', 'open'],
    }
    ESIG_REQUIRED_ACTIONS = []

    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='findings')
    finding_number = models.CharField(max_length=30, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITIES)
    description = models.TextField()
    reference_clause = models.CharField(max_length=200, blank=True)
    due_date = models.DateField(null=True, blank=True)
    capa = models.ForeignKey(
        'quality.Capa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_findings',
    )
    status = models.CharField(max_length=30, choices=STATUSES, default='open')

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.finding_number:
            count = Finding.objects.filter(audit=self.audit).count() + 1
            self.finding_number = f"{self.audit.audit_number}-F{count:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.finding_number} ({self.severity})"


class AuditResponse(BaseModel):
    finding = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='responses')
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='audit_responses',
    )
    response_text = models.TextField()
    accepted_by_lead = models.BooleanField(default=False)

    history = HistoricalRecords()

    def __str__(self):
        return f"Response to {self.finding.finding_number} by {self.responder}"
