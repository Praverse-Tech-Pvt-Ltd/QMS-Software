from django.conf import settings
from django.db import models
from simple_history.models import HistoricalRecords

from core.utils import add_months, generate_qms_id
from shared.models import BaseModel


class AnalyticalTechnique(BaseModel):
    """Master list of analytical techniques an analyst can be qualified on."""
    COMPLEXITY = [
        ('complex', 'Complex'),
        ('non_complex', 'Non-Complex'),
    ]

    name = models.CharField(max_length=200)
    complexity = models.CharField(max_length=20, choices=COMPLEXITY)
    description = models.TextField(blank=True)
    required_training_sop = models.ForeignKey(
        'dms.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        to_field='document_id',
    )

    history = HistoricalRecords()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class AnalystQualificationRecord(BaseModel):
    """
    Tracks an analyst's qualification status on a given analytical technique
    (optionally tied to a specific instrument). Qualification is valid for one
    year from qualification_date unless an explicit expiry_date is supplied.
    """
    TRANSITIONS = {
        'pending': ['under_review'],
        'under_review': ['qualified', 'not_qualified'],
        'qualified': ['expired', 'not_qualified'],
        'not_qualified': ['pending'],
        'expired': ['pending'],
    }
    # approve -> qualified, reject/revoke -> not_qualified all require e-signature
    ESIG_REQUIRED_ACTIONS = ['qualified', 'not_qualified']

    STATUS = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('qualified', 'Qualified'),
        ('not_qualified', 'Not Qualified'),
        ('expired', 'Expired'),
    ]

    qualification_id = models.CharField(max_length=30, unique=True, blank=True)
    analyst = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='qualifications',
    )
    technique = models.ForeignKey(AnalyticalTechnique, on_delete=models.PROTECT)
    instrument = models.ForeignKey(
        'laboratory.Instrument',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    qualification_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='qualifications_approved',
    )
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    notes = models.TextField(blank=True)

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.qualification_id:
            self.qualification_id = generate_qms_id(AnalystQualificationRecord, 'qualification_id', 'AQR')
        if self.qualification_date and not self.expiry_date:
            # add_months() lives in core.utils and avoids pulling in python-dateutil
            # purely for a 12-month offset; it already handles calendar rollover.
            self.expiry_date = add_months(self.qualification_date, 12)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.qualification_id} — {self.analyst} / {self.technique}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ('analyst', 'technique', 'instrument')
