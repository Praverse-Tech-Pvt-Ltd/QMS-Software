from django.contrib import admin
from .models import Deviation

@admin.register(Deviation)
class DeviationAdmin(admin.ModelAdmin):
    list_display = ['deviation_id', 'title', 'risk_level', 'status', 'raised_by', 'occurrence_date']
    list_filter = ['risk_level', 'status', 'department']
    search_fields = ['deviation_id', 'title']