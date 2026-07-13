from django.contrib import admin
from .models import StabilityProtocol, StabilityPullPoint


@admin.register(StabilityProtocol)
class StabilityProtocolAdmin(admin.ModelAdmin):
    list_display = ['protocol_number', 'product', 'batch_lot', 'study_type', 'status']
    list_filter = ['study_type', 'status']
    search_fields = ['protocol_number', 'product', 'batch_lot']


@admin.register(StabilityPullPoint)
class StabilityPullPointAdmin(admin.ModelAdmin):
    list_display = ['protocol', 'time_point', 'scheduled_date', 'status', 'oot_flag']
    list_filter = ['status', 'oot_flag']
