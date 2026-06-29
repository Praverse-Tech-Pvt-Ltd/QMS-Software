from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel, ESignature
from core.utils import generate_qms_id


class MasterBatchRecord(BaseModel):
    STATUS = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('obsolete', 'Obsolete'),
    ]
    TRANSITIONS = {
        'draft': ['approved'],
        'approved': ['obsolete'],
    }
    ESIG_REQUIRED_ACTIONS = ['approved']

    product = models.CharField(max_length=200)
    version = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS, default='draft')
    theoretical_yield = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    yield_formula = models.TextField(blank=True)
    description = models.TextField(blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"MBR: {self.product} v{self.version}"

    class Meta:
        unique_together = ('product', 'version')


class MBRStep(models.Model):
    mbr = models.ForeignKey(MasterBatchRecord, on_delete=models.CASCADE, related_name='steps')
    step_number = models.PositiveIntegerField()
    description = models.TextField()
    is_critical = models.BooleanField(default=False)
    esig_required = models.BooleanField(default=False)
    expected_range = models.CharField(max_length=200, blank=True, help_text='e.g. 98.0–102.0%')

    class Meta:
        ordering = ['step_number']
        unique_together = ('mbr', 'step_number')


class BatchProductionRecord(BaseModel):
    STATUS = [
        ('issued', 'Issued'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('released', 'Released'),
    ]
    TRANSITIONS = {
        'issued': ['in_progress'],
        'in_progress': ['completed'],
        'completed': ['released'],
    }
    ESIG_REQUIRED_ACTIONS = ['released']

    mbr = models.ForeignKey(MasterBatchRecord, on_delete=models.PROTECT, related_name='batch_records')
    batch_number = models.CharField(max_length=50, unique=True)
    manufacture_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='issued')
    actual_yield = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"BPR: {self.batch_number}"

    class Meta:
        ordering = ['-manufacture_date']


class BPRStep(models.Model):
    bpr = models.ForeignKey(BatchProductionRecord, on_delete=models.CASCADE, related_name='steps')
    mbr_step = models.ForeignKey(MBRStep, on_delete=models.PROTECT, related_name='bpr_executions')
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='completed_steps',
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    actual_value = models.CharField(max_length=200, blank=True)
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT, null=True, blank=True)
    deviation_linked = models.ForeignKey(
        'quality.Deviation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bpr_steps',
    )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Auto-create deviation if value is outside expected range
        if self.actual_value and self.mbr_step.expected_range and not self.deviation_linked:
            self._check_range()

    def _check_range(self):
        try:
            from quality.models import Deviation
            range_str = self.mbr_step.expected_range
            if '–' in range_str or '-' in range_str:
                sep = '–' if '–' in range_str else '-'
                parts = range_str.split(sep)
                low, high = float(parts[0].strip().replace('%', '')), float(parts[1].strip().replace('%', ''))
                val = float(self.actual_value.strip().replace('%', ''))
                if val < low or val > high:
                    dev = Deviation.objects.create(
                        title=f'BPR Step deviation: {self.mbr_step.description[:80]}',
                        description=f'BPR {self.bpr.batch_number} Step {self.mbr_step.step_number}: value {self.actual_value} outside range {self.mbr_step.expected_range}',
                        risk_level='MAJOR',
                        department=self.bpr.mbr.product,
                        raised_by=self.completed_by,
                    )
                    self.deviation_linked = dev
                    BPRStep.objects.filter(pk=self.pk).update(deviation_linked=dev)
        except Exception:
            pass


class IPQCCheck(BaseModel):
    """In-Process Quality Control check recorded during batch production."""
    bpr = models.ForeignKey(BatchProductionRecord, on_delete=models.PROTECT, related_name='ipqc_checks')
    parameter = models.CharField(max_length=200)
    frequency = models.CharField(max_length=100)
    lower_limit = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    upper_limit = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    result = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    pass_fail = models.CharField(max_length=10, blank=True)
    checked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True,
        related_name='ipqc_checks',
    )
    checked_at = models.DateTimeField(null=True, blank=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if self.result is not None:
            failed = False
            if self.lower_limit is not None and self.result < self.lower_limit:
                failed = True
            if self.upper_limit is not None and self.result > self.upper_limit:
                failed = True
            self.pass_fail = 'fail' if failed else 'pass'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"IPQC {self.parameter} — BPR {self.bpr.batch_number}"


class BatchRelease(BaseModel):
    bpr = models.OneToOneField(BatchProductionRecord, on_delete=models.CASCADE, related_name='release')
    released_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='batch_releases',
    )
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT)
    release_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
