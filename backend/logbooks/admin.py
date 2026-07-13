from django.contrib import admin
from .models import Logbook, LogbookEntry


@admin.register(Logbook)
class LogbookAdmin(admin.ModelAdmin):
    list_display = ['name', 'logbook_type', 'department', 'location', 'is_active']
    list_filter = ['logbook_type', 'department', 'is_active']
    search_fields = ['name', 'equipment_id']


@admin.register(LogbookEntry)
class LogbookEntryAdmin(admin.ModelAdmin):
    list_display = ['logbook', 'entry_date', 'entry_time', 'performed_by', 'condition']
    list_filter = ['condition', 'entry_date']
    search_fields = ['logbook__name', 'activity']
