from django.db import models
from django.conf import settings
from shared.models import BaseModel, ESignature


class APQRReport(BaseModel):
    STATUS = [
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
    ]
    TRANSITIONS = {
        'draft': ['under_review'],
        'under_review': ['approved'],
    }
    ESIG_REQUIRED_ACTIONS = ['approved']

    product = models.CharField(max_length=200)
    period_start = models.DateField()
    period_end = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='draft')
    generated_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='approved_apqrs',
    )
    content = models.JSONField(default=dict, help_text='AI-generated section content')
    esignature = models.ForeignKey(ESignature, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f"APQR: {self.product} {self.period_start.year}"

    class Meta:
        ordering = ['-period_end']
