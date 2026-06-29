from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


class Risk(BaseModel):
    CATEGORIES = [
        ('process', 'Process'),
        ('product', 'Product'),
        ('supplier', 'Supplier'),
        ('regulatory', 'Regulatory / Compliance'),
        ('it', 'IT / Data Integrity'),
    ]
    STATUS = [
        ('open', 'Open'),
        ('mitigated', 'Mitigated'),
        ('accepted', 'Accepted'),
        ('closed', 'Closed'),
    ]
    TRANSITIONS = {
        'open': ['mitigated', 'accepted'],
        'mitigated': ['closed', 'open'],
        'accepted': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['accepted', 'closed']

    risk_id = models.CharField(max_length=30, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    description = models.TextField()
    potential_effect = models.TextField()
    severity = models.PositiveSmallIntegerField(help_text='1–5 (ICH Q9 FMEA scale)')
    occurrence = models.PositiveSmallIntegerField(help_text='1–5')
    detection = models.PositiveSmallIntegerField(help_text='1–5')
    rpn_threshold = models.PositiveIntegerField(default=50)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='owned_risks',
    )
    status = models.CharField(max_length=20, choices=STATUS, default='open')
    linked_capa = models.ForeignKey(
        'quality.Capa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risks',
    )

    history = HistoricalRecords()

    @property
    def rpn(self) -> int:
        return self.severity * self.occurrence * self.detection

    @property
    def risk_level(self) -> str:
        r = self.rpn
        if r < 25:
            return 'Low'
        elif r < 50:
            return 'Medium'
        elif r < 75:
            return 'High'
        return 'Critical'

    def save(self, *args, **kwargs):
        if not self.risk_id:
            self.risk_id = generate_qms_id(Risk, 'risk_id', 'RSK')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.risk_id} — {self.category} (RPN={self.rpn})"

    class Meta:
        ordering = ['-created_at']


class Mitigation(BaseModel):
    STATUSES = [
        ('open', 'Open'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    risk = models.ForeignKey(Risk, on_delete=models.CASCADE, related_name='mitigations')
    description = models.TextField()
    action_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='mitigations',
    )
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUSES, default='open')

    history = HistoricalRecords()


class ResidualRisk(models.Model):
    risk = models.OneToOneField(Risk, on_delete=models.CASCADE, related_name='residual')
    residual_severity = models.PositiveSmallIntegerField()
    residual_occurrence = models.PositiveSmallIntegerField()
    residual_detection = models.PositiveSmallIntegerField()
    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='residual_assessments',
    )
    assessed_at = models.DateTimeField(auto_now_add=True)

    @property
    def residual_rpn(self) -> int:
        return self.residual_severity * self.residual_occurrence * self.residual_detection
