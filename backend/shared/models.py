import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from simple_history.models import HistoricalRecords
from core.models import TimeStampedModel


class BaseModel(TimeStampedModel):
    """
    Abstract base for all regulated QMS models.
    Provides UUID PK, soft-delete, and user tracking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='+',
    )
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='+',
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)
    site = models.ForeignKey(
        'accounts.Site',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        """
        Hard deletion is not permitted on regulated records.
        This is a 21 CFR Part 11 requirement — records must be preserved
        for audit integrity. Use soft_delete() instead.

        Raises:
            NotImplementedError: always, to prevent accidental deletion
        """
        raise NotImplementedError(
            f"{self.__class__.__name__} records cannot be hard-deleted. "
            "Use soft_delete(user) to deactivate the record. "
            "21 CFR Part 11 requires all regulated records to be preserved."
        )

    def soft_delete(self, user):
        """Deactivate this record without deleting it."""
        self.is_active = False
        self.modified_by = user
        self.save(update_fields=['is_active', 'modified_by', 'updated_at'])


class ESignature(models.Model):
    """
    Immutable e-signature record (21 CFR Part 11).
    One record per critical approval action.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='esignatures',
    )
    signed_at = models.DateTimeField(default=timezone.now)
    # Store hashed confirmation, not plaintext
    password_hash = models.CharField(max_length=255)
    record_type = models.CharField(max_length=100)
    record_id = models.CharField(max_length=50)
    action = models.CharField(max_length=100)
    meaning = models.TextField(
        default='',
        help_text='Meaning of the signature (e.g. "I approve this CAPA closure")',
    )

    class Meta:
        ordering = ['-signed_at']

    def __str__(self):
        return f"{self.user} signed {self.action} on {self.record_type}:{self.record_id}"


class ActionItem(BaseModel):
    """
    Extracted action item from reviewer remarks.
    Created by Algorithm E (shared/ai/action_extractor.py).
    Spans all regulated modules (change control, CAPA, audits, complaints).
    """
    # Category values match shared.ai.action_extractor.ACTION_CATEGORIES exactly
    # (lowercase, underscore-separated) — not the Title Case originally proposed,
    # since the extractor is the only writer of this field.
    ACTION_CATEGORIES = [
        ('training', 'Training'),
        ('validation', 'Validation'),
        ('documentation', 'Documentation'),
        ('investigation', 'Investigation'),
        ('regulatory_filing', 'Regulatory Filing'),
        ('implementation', 'Implementation'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
        ('extended', 'Extended'),
    ]

    # Link to the parent regulated record (generic FK by string, not a true GenericForeignKey,
    # matching the pattern already used by shared.models.ESignature)
    record_type = models.CharField(max_length=100)
    record_id = models.CharField(max_length=100)

    action = models.TextField()
    category = models.CharField(max_length=50, choices=ACTION_CATEGORIES)
    suggested_owner_role = models.CharField(max_length=100, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='action_items',
    )
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    evidence_note = models.TextField(blank=True)
    extension_reason = models.TextField(blank=True)  # required (enforced in view) if status=extended
    source_remark = models.TextField(blank=True)  # original remark text
    history = HistoricalRecords()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.category}] {self.action[:60]} ({self.status})"
