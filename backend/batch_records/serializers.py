from rest_framework import serializers
from .models import MasterBatchRecord, MBRStep, BatchProductionRecord, BPRStep


class MBRStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = MBRStep
        fields = ['id', 'step_number', 'description', 'is_critical', 'esig_required', 'expected_range']


class MasterBatchRecordSerializer(serializers.ModelSerializer):
    steps = MBRStepSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MasterBatchRecord
        fields = [
            'id', 'product', 'version', 'status', 'status_display',
            'theoretical_yield', 'yield_formula', 'description',
            'created_at', 'updated_at', 'steps',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BPRStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = BPRStep
        fields = ['id', 'mbr_step', 'completed_by', 'completed_at', 'actual_value', 'deviation_linked']


class BatchProductionRecordSerializer(serializers.ModelSerializer):
    steps = BPRStepSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BatchProductionRecord
        fields = [
            'id', 'mbr', 'batch_number', 'manufacture_date',
            'status', 'status_display', 'actual_yield',
            'created_at', 'updated_at', 'steps',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
