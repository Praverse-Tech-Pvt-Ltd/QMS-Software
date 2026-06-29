from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class AuditLog(models.Model):
    """
    Centralized Audit Trail that can track changes on ANY model.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
    ]

    # Who performed the action?
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='audit_logs'
    )
    user_email = models.EmailField(null=True, help_text="Snapshot of user email in case user is deleted")

    # What action was taken?
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True, help_text="Reason for change (if required)")

    # Which record was changed? (Generic Relation)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=50)
    content_object = GenericForeignKey('content_type', 'object_id')

    # Detailed Changes (Old Value vs New Value)
    # Stores data like: { "status": { "old": "Draft", "new": "Approved" } }
    changes = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['content_type', 'object_id']), # Fast lookups for specific records
            models.Index(fields=['user']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.content_type} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    def delete(self, *args, **kwargs):
        raise NotImplementedError(
            "AuditLog records are immutable and cannot be deleted by any means. "
            "This is a 21 CFR Part 11 requirement."
        )

    def soft_delete(self, user):
        raise NotImplementedError(
            "AuditLog records cannot be deactivated. They are permanent."
        )