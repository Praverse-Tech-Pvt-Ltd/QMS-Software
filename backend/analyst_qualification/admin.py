from django.contrib import admin
from .models import AnalyticalTechnique, AnalystQualificationRecord


@admin.register(AnalyticalTechnique)
class AnalyticalTechniqueAdmin(admin.ModelAdmin):
    list_display = ['name', 'complexity', 'required_training_sop']
    list_filter = ['complexity']
    search_fields = ['name']


@admin.register(AnalystQualificationRecord)
class AnalystQualificationRecordAdmin(admin.ModelAdmin):
    list_display = ['qualification_id', 'analyst', 'technique', 'status', 'qualification_date', 'expiry_date']
    list_filter = ['status', 'technique']
    search_fields = ['qualification_id']
