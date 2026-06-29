from rest_framework import serializers
from .models import Risk, Mitigation, ResidualRisk


class MitigationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mitigation
        fields = ['id', 'description', 'action_owner', 'due_date', 'completion_date', 'status']
        read_only_fields = ['id']


class ResidualRiskSerializer(serializers.ModelSerializer):
    residual_rpn = serializers.IntegerField(read_only=True)

    class Meta:
        model = ResidualRisk
        fields = ['residual_severity', 'residual_occurrence', 'residual_detection', 'residual_rpn', 'assessed_at']


class RiskSerializer(serializers.ModelSerializer):
    rpn = serializers.IntegerField(read_only=True)
    risk_level = serializers.CharField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    mitigations = MitigationSerializer(many=True, read_only=True)
    residual = ResidualRiskSerializer(read_only=True)

    class Meta:
        model = Risk
        fields = [
            'id', 'risk_id', 'category', 'category_display', 'description', 'potential_effect',
            'severity', 'occurrence', 'detection', 'rpn', 'risk_level',
            'rpn_threshold', 'owner', 'owner_name', 'status', 'status_display',
            'linked_capa', 'created_at', 'updated_at', 'mitigations', 'residual',
        ]
        read_only_fields = ['id', 'risk_id', 'created_at', 'updated_at']
