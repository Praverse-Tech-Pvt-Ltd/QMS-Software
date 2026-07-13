from datetime import date

from django.db import models
from simple_history.models import HistoricalRecords
from shared.models import BaseModel
from core.utils import generate_qms_id


class RecallRecord(BaseModel):
    """
    Product recall record. Class I/II/III per FDA severity classification.
    """
    TRANSITIONS = {
        'initiated': ['active'],
        'active': ['completed', 'closed'],
        'completed': ['closed'],
    }
    ESIG_REQUIRED_ACTIONS = ['active', 'closed']

    RECALL_CLASSES = [
        ('I', 'Class I — health hazard'),
        ('II', 'Class II — may cause adverse health consequences'),
        ('III', 'Class III — not likely to cause adverse health consequences'),
    ]
    STATUS = [
        ('initiated', 'Initiated'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('closed', 'Closed'),
    ]

    recall_number = models.CharField(max_length=50, unique=True, blank=True)
    product = models.CharField(max_length=200)
    batch_lots = models.JSONField(default=list)  # list of affected batch numbers
    recall_class = models.CharField(max_length=10, choices=RECALL_CLASSES)
    reason = models.TextField()
    initiated_date = models.DateField(default=date.today)
    regulatory_notified = models.BooleanField(default=False)
    notification_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='initiated')
    linked_complaint = models.ForeignKey(
        'complaints.Complaint', on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )
    linked_nc = models.ForeignKey(
        'nonconformance.NCReport', on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.recall_number:
            self.recall_number = generate_qms_id(RecallRecord, 'recall_number', 'RCL')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.recall_number} — {self.product} (Class {self.recall_class})"

    class Meta:
        ordering = ['-initiated_date']
