from rest_framework import serializers
from datetime import date
from .models import Complaint, Investigation, MDRReport


class ComplaintSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    complainant_type_display = serializers.CharField(source='get_complainant_type_display', read_only=True)
    days_overdue = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_number', 'received_date', 'complainant_type', 'complainant_type_display',
            'product', 'batch_lot', 'description', 'severity', 'severity_display',
            'regulatory_reportable', 'response_deadline', 'status', 'status_display',
            'linked_nc', 'linked_capa', 'mdr_submission_date',
            'created_at', 'updated_at', 'days_overdue', 'is_overdue',
        ]
        read_only_fields = ['id', 'complaint_number', 'response_deadline', 'created_at', 'updated_at']

    def get_days_overdue(self, obj):
        if obj.response_deadline and obj.status != 'closed':
            delta = (date.today() - obj.response_deadline).days
            return delta if delta > 0 else 0
        return 0

    def get_is_overdue(self, obj):
        return self.get_days_overdue(obj) > 0
