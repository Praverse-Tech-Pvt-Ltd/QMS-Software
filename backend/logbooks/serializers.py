from rest_framework import serializers
from .models import Logbook, LogbookEntry


class LogbookEntrySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)

    class Meta:
        model = LogbookEntry
        fields = [
            'id', 'logbook', 'entry_date', 'entry_time', 'activity',
            'performed_by', 'performed_by_name', 'usage_hours', 'batch_lot',
            'condition', 'condition_display', 'ai_remark_draft',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'logbook', 'performed_by', 'created_at', 'updated_at']


class LogbookSerializer(serializers.ModelSerializer):
    logbook_type_display = serializers.CharField(source='get_logbook_type_display', read_only=True)
    last_entry_date = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()

    class Meta:
        model = Logbook
        fields = [
            'id', 'name', 'logbook_type', 'logbook_type_display', 'equipment_id',
            'location', 'department', 'last_entry_date', 'entry_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_entry_date(self, obj):
        last = obj.entries.filter(is_active=True).order_by('-entry_date', '-entry_time').first()
        return last.entry_date if last else None

    def get_entry_count(self, obj):
        return obj.entries.filter(is_active=True).count()
