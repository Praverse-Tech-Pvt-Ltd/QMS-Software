from rest_framework import serializers
from .models import RecallRecord


class RecallRecordSerializer(serializers.ModelSerializer):
    recall_class_display = serializers.CharField(source='get_recall_class_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    linked_complaint_number = serializers.CharField(source='linked_complaint.complaint_number', read_only=True, default=None)
    linked_nc_number = serializers.CharField(source='linked_nc.nc_number', read_only=True, default=None)

    class Meta:
        model = RecallRecord
        fields = [
            'id', 'recall_number', 'product', 'batch_lots', 'recall_class', 'recall_class_display',
            'reason', 'initiated_date', 'regulatory_notified', 'notification_date',
            'status', 'status_display', 'linked_complaint', 'linked_complaint_number',
            'linked_nc', 'linked_nc_number', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'recall_number', 'status', 'created_at', 'updated_at']
