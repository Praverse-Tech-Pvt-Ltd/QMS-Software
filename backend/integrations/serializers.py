from rest_framework import serializers
from .models import IntegrationConfig, IntegrationSyncLog


class IntegrationConfigSerializer(serializers.ModelSerializer):
    system_type_display = serializers.CharField(source='get_system_type_display', read_only=True)

    class Meta:
        model = IntegrationConfig
        fields = [
            'id', 'system_type', 'system_type_display', 'name', 'base_url',
            'is_active', 'config', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class IntegrationSyncLogSerializer(serializers.ModelSerializer):
    """Read-only — sync logs are append-only and written by the sync process itself, not via this API."""
    direction_display = serializers.CharField(source='get_direction_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = IntegrationSyncLog
        fields = [
            'id', 'config', 'direction', 'direction_display', 'entity_type',
            'status', 'status_display', 'records_synced', 'error_message',
            'started_at', 'completed_at',
        ]
        read_only_fields = fields
