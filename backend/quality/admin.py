from django.contrib import admin
from .models import Deviation, CCFTemplate

@admin.register(Deviation)
class DeviationAdmin(admin.ModelAdmin):
    list_display = ['deviation_id', 'title', 'risk_level', 'status', 'raised_by', 'occurrence_date']
    list_filter = ['risk_level', 'status', 'department']
    search_fields = ['deviation_id', 'title']


@admin.register(CCFTemplate)
class CCFTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'change_category', 'is_default']
    list_filter = ['change_category', 'is_default']
    search_fields = ['name', 'change_category']