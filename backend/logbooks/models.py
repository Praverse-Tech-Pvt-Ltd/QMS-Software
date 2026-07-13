from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel, ESignature


class Logbook(BaseModel):
    """Master logbook — one per equipment, area, or instrument."""
    LOGBOOK_TYPES = [
        ('equipment', 'Equipment Logbook'),
        ('area', 'Area / Room Logbook'),
        ('instrument', 'Instrument Logbook'),
    ]

    name = models.CharField(max_length=200)
    logbook_type = models.CharField(max_length=20, choices=LOGBOOK_TYPES)
    equipment_id = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_logbook_type_display()})"


class LogbookEntry(BaseModel):
    """
    A single logbook entry. Every entry is e-signed at creation — GMP logbooks
    require an attestation of accuracy per entry, not just on abnormal events.
    """
    CONDITIONS = [
        ('normal', 'Normal'),
        ('abnormal', 'Abnormal'),
        ('out_of_service', 'Out of Service'),
    ]

    logbook = models.ForeignKey(Logbook, on_delete=models.PROTECT, related_name='entries')
    entry_date = models.DateField()
    entry_time = models.TimeField()
    activity = models.TextField()
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='logbook_entries',
    )
    usage_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    batch_lot = models.CharField(max_length=100, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITIONS, default='normal')
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT)
    # Phase 6 AI hook (provision only): populated by the frontend from
    # POST /api/v1/ai/remark/ (module='logbook') when condition=abnormal, then
    # saved back here via PATCH. No server-side AI call — matches the pattern
    # already used by laboratory/batch_records (AIRemarkField is frontend-driven).
    ai_remark_draft = models.TextField(blank=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ['-entry_date', '-entry_time']
        verbose_name_plural = 'Logbook entries'

    def __str__(self):
        return f"{self.logbook.name} — {self.entry_date} {self.entry_time}"
