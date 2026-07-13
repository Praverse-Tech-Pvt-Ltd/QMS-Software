from django.contrib import admin
from .models import IntegrationConfig, IntegrationSyncLog


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    list_display = ['name', 'system_type', 'base_url', 'is_active', 'created_at']
    list_filter = ['system_type', 'is_active']
    search_fields = ['name', 'base_url']


@admin.register(IntegrationSyncLog)
class IntegrationSyncLogAdmin(admin.ModelAdmin):
    list_display = ['config', 'direction', 'entity_type', 'status', 'records_synced', 'started_at', 'completed_at']
    list_filter = ['direction', 'status']
    search_fields = ['entity_type']
