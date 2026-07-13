from django.contrib import admin
from .models import EMSamplingPlan, EMResult


@admin.register(EMSamplingPlan)
class EMSamplingPlanAdmin(admin.ModelAdmin):
    list_display = ['area', 'classification', 'monitoring_type', 'frequency', 'action_limit', 'alert_limit']
    list_filter = ['classification', 'monitoring_type']
    search_fields = ['area']


@admin.register(EMResult)
class EMResultAdmin(admin.ModelAdmin):
    list_display = ['sampling_plan', 'sampling_date', 'result_value', 'result_status']
    list_filter = ['result_status']
