from django.db import models


class IntegrationConfig(models.Model):
    """
    Configuration for an external ERP system integration (SAP, Oracle, or a
    generic REST endpoint). Only one config should be `is_active=True` at a
    time per the adapter factory's lookup — activating a new one is a
    deliberate cutover, not something the API enforces automatically.

    NEVER store credentials here — use environment variables and reference
    them by name only (if at all) inside `config`.
    """
    SYSTEM_TYPES = [
        ('sap', 'SAP ERP'),
        ('oracle', 'Oracle ERP'),
        ('generic_rest', 'Generic REST API'),
    ]

    system_type = models.CharField(max_length=50, choices=SYSTEM_TYPES)
    name = models.CharField(max_length=200)
    base_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.system_type})"

    class Meta:
        ordering = ['-created_at']


class IntegrationSyncLog(models.Model):
    """
    Append-only record of a sync attempt against an ERP system. Matches
    core.models.AuditLog's immutability pattern — no update, no delete.
    """
    DIRECTIONS = [
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
    ]
    STATUSES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('partial', 'Partial'),
    ]

    config = models.ForeignKey(IntegrationConfig, on_delete=models.CASCADE, related_name='sync_logs')
    direction = models.CharField(max_length=10, choices=DIRECTIONS)
    entity_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUSES)
    records_synced = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.config_id} {self.direction} {self.entity_type} ({self.status})"

    def delete(self, *args, **kwargs):
        raise NotImplementedError("Integration sync logs are immutable.")

    class Meta:
        ordering = ['-started_at']
