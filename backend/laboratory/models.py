from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


class Sample(BaseModel):
    TYPES = [
        ('raw_material', 'Raw Material'),
        ('in_process', 'In-Process'),
        ('finished', 'Finished Product'),
        ('stability', 'Stability'),
        ('environmental', 'Environmental'),
    ]
    STATUS = [
        ('received', 'Received'),
        ('testing', 'Testing'),
        ('completed', 'Completed'),
        ('released', 'Released'),
        ('rejected', 'Rejected'),
    ]
    TRANSITIONS = {
        'received': ['testing'],
        'testing': ['completed'],
        'completed': ['released', 'rejected'],
    }
    ESIG_REQUIRED_ACTIONS = ['released', 'rejected']

    sample_number = models.CharField(max_length=30, unique=True, blank=True)
    product = models.CharField(max_length=200)
    batch_lot = models.CharField(max_length=100)
    sample_type = models.CharField(max_length=20, choices=TYPES)
    received_date = models.DateField()
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='received_samples',
    )
    status = models.CharField(max_length=20, choices=STATUS, default='received')

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.sample_number:
            self.sample_number = generate_qms_id(Sample, 'sample_number', 'SMP')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sample_number} — {self.product}"

    class Meta:
        ordering = ['-received_date']


class Specification(BaseModel):
    product = models.CharField(max_length=200)
    test_name = models.CharField(max_length=200)
    method = models.CharField(max_length=200, blank=True)
    lower_limit = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    upper_limit = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    unit = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.product} — {self.test_name}"


class TestRequest(BaseModel):
    STATUS = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    sample = models.ForeignKey(Sample, on_delete=models.CASCADE, related_name='test_requests')
    test_name = models.CharField(max_length=200)
    method = models.CharField(max_length=200, blank=True)
    assigned_analyst = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='assigned_tests',
    )
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')

    history = HistoricalRecords()


class COATemplate(BaseModel):
    """Certificate of Analysis template per product — defines sections and authorized signatory block."""
    product = models.CharField(max_length=200)
    template_name = models.CharField(max_length=200)
    header_text = models.TextField(blank=True)
    footer_text = models.TextField(blank=True)
    test_sections = models.JSONField(default=list)
    # Format: [{"section_name": "Physical", "tests": ["Appearance", "pH"]}, ...]
    is_active = models.BooleanField(default=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.template_name} — {self.product}"

    class Meta:
        unique_together = ('product', 'template_name')


class TestResult(BaseModel):
    test_request = models.OneToOneField(TestRequest, on_delete=models.CASCADE, related_name='result')
    result_value = models.DecimalField(max_digits=12, decimal_places=4)
    unit = models.CharField(max_length=30)
    specification_lower = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    specification_upper = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='entered_results',
    )
    entered_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='reviewed_results',
    )

    history = HistoricalRecords()

    @property
    def pass_fail(self) -> str:
        if self.specification_lower is not None and self.result_value < self.specification_lower:
            return 'fail'
        if self.specification_upper is not None and self.result_value > self.specification_upper:
            return 'fail'
        return 'pass'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Auto-create OOS if test fails
        if self.pass_fail == 'fail':
            self._trigger_oos()

    def _trigger_oos(self):
        try:
            from quality.models import OOSInvestigation
            sample = self.test_request.sample
            OOSInvestigation.objects.get_or_create(
                linked_test_result=self,
                defaults={
                    'product': sample.product,
                    'batch_lot': sample.batch_lot,
                    'test_name': self.test_request.test_name,
                    'result_obtained': str(self.result_value),
                    'phase': 'phase1',
                    'created_by': self.created_by,
                    'modified_by': self.created_by,
                },
            )
        except Exception:
            pass
