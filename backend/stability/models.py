import calendar
from datetime import date

from django.db import models
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


def add_months(start: date, months: int) -> date:
    """Add calendar months to a date without pulling in a third-party dependency."""
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


class StabilityProtocol(BaseModel):
    """
    ICH Q1A(R2) stability study protocol. Pull points are auto-generated on
    creation from STUDY_TIME_POINTS_MONTHS for the chosen study_type.
    """
    # Real-world ICH Q1A(R2) sampling intervals (months) per study type.
    STUDY_TIME_POINTS_MONTHS = {
        'long_term': [0, 3, 6, 9, 12, 18, 24, 36],
        'accelerated': [0, 3, 6],
        'intermediate': [0, 6, 9, 12],
        'stress': [0, 1, 2, 3],
    }

    TRANSITIONS = {
        'draft': ['approved'],
        'approved': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['approved', 'closed']

    STUDY_TYPES = [
        ('long_term', 'Long Term'),
        ('accelerated', 'Accelerated'),
        ('intermediate', 'Intermediate'),
        ('stress', 'Stress'),
    ]
    STATUS = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('closed', 'Closed'),
    ]

    protocol_number = models.CharField(max_length=30, unique=True, blank=True)
    product = models.CharField(max_length=200)
    batch_lot = models.CharField(max_length=100)
    study_type = models.CharField(max_length=20, choices=STUDY_TYPES)
    storage_condition = models.CharField(max_length=100)  # e.g. "25C/60%RH"
    study_start_date = models.DateField()
    planned_end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='draft')

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.protocol_number:
            self.protocol_number = generate_qms_id(StabilityProtocol, 'protocol_number', 'STB')
        super().save(*args, **kwargs)

    def generate_pull_points(self):
        """Create StabilityPullPoint rows for each ICH time point of this study type."""
        months = self.STUDY_TIME_POINTS_MONTHS.get(self.study_type, [0])
        for m in months:
            StabilityPullPoint.objects.get_or_create(
                protocol=self,
                time_point=f'{m}M',
                defaults={
                    'scheduled_date': add_months(self.study_start_date, m),
                    'created_by': self.created_by,
                    'modified_by': self.created_by,
                },
            )

    def __str__(self):
        return f"{self.protocol_number} — {self.product} ({self.batch_lot})"

    class Meta:
        ordering = ['-created_at']


class StabilityPullPoint(BaseModel):
    """Scheduled time point when samples are pulled for testing."""
    STATUS = [
        ('pending', 'Pending'),
        ('pulled', 'Pulled'),
        ('overdue', 'Overdue'),
        ('completed', 'Completed'),
    ]

    protocol = models.ForeignKey(StabilityProtocol, on_delete=models.PROTECT, related_name='pull_points')
    time_point = models.CharField(max_length=50)  # e.g. "3M", "6M", "12M"
    scheduled_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    linked_sample = models.ForeignKey(
        'laboratory.Sample', on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )
    oot_flag = models.BooleanField(default=False, help_text='Out-of-trend result flagged for QA review')
    # Phase 6 AI hook (provision only): populated by the frontend from
    # POST /api/v1/ai/remark/ (module='stability', stage='oot_detected') when
    # oot_flag is set, then saved back here via PATCH — same pattern as
    # logbooks.LogbookEntry.ai_remark_draft.
    ai_remark_draft = models.TextField(blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.protocol.protocol_number} — {self.time_point}"

    class Meta:
        ordering = ['scheduled_date']
