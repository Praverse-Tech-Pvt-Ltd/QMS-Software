from rest_framework import serializers
from .models import EMSamplingPlan, EMResult


class EMSamplingPlanSerializer(serializers.ModelSerializer):
    classification_display = serializers.CharField(source='get_classification_display', read_only=True)
    monitoring_type_display = serializers.CharField(source='get_monitoring_type_display', read_only=True)

    class Meta:
        model = EMSamplingPlan
        fields = [
            'id', 'area', 'classification', 'classification_display', 'monitoring_type',
            'monitoring_type_display', 'frequency', 'action_limit', 'alert_limit',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EMResultSerializer(serializers.ModelSerializer):
    sampled_by_name = serializers.CharField(source='sampled_by.get_full_name', read_only=True)
    result_status_display = serializers.CharField(source='get_result_status_display', read_only=True)
    area = serializers.CharField(source='sampling_plan.area', read_only=True)

    class Meta:
        model = EMResult
        fields = [
            'id', 'sampling_plan', 'area', 'sampling_date', 'sampled_by', 'sampled_by_name',
            'result_value', 'result_status', 'result_status_display', 'linked_deviation',
            'created_at',
        ]
        read_only_fields = ['id', 'sampled_by', 'result_status', 'linked_deviation', 'created_at']
