from rest_framework import serializers
from .models import StabilityProtocol, StabilityPullPoint


class StabilityPullPointSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = StabilityPullPoint
        fields = [
            'id', 'protocol', 'time_point', 'scheduled_date', 'actual_date',
            'status', 'status_display', 'linked_sample', 'oot_flag', 'ai_remark_draft',
        ]
        read_only_fields = ['id', 'protocol']


class StabilityProtocolSerializer(serializers.ModelSerializer):
    study_type_display = serializers.CharField(source='get_study_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pull_points = StabilityPullPointSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StabilityProtocol
        fields = [
            'id', 'protocol_number', 'product', 'batch_lot', 'study_type', 'study_type_display',
            'storage_condition', 'study_start_date', 'planned_end_date', 'status', 'status_display',
            'created_at', 'updated_at', 'pull_points', 'progress',
        ]
        read_only_fields = ['id', 'protocol_number', 'status', 'created_at', 'updated_at']

    def get_progress(self, obj):
        total = obj.pull_points.count()
        completed = obj.pull_points.filter(status='completed').count()
        return {'total': total, 'completed': completed}
