from django.contrib import admin
from .models import RecallRecord


@admin.register(RecallRecord)
class RecallRecordAdmin(admin.ModelAdmin):
    list_display = ['recall_number', 'product', 'recall_class', 'status', 'regulatory_notified']
    list_filter = ['recall_class', 'status', 'regulatory_notified']
    search_fields = ['recall_number', 'product']
