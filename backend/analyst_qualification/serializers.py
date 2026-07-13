from rest_framework import serializers

from .models import AnalyticalTechnique, AnalystQualificationRecord


class AnalyticalTechniqueSerializer(serializers.ModelSerializer):
    complexity_display = serializers.CharField(source='get_complexity_display', read_only=True)

    class Meta:
        model = AnalyticalTechnique
        fields = [
            'id', 'name', 'complexity', 'complexity_display', 'description',
            'required_training_sop', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnalystQualificationRecordSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    technique_name = serializers.CharField(source='technique.name', read_only=True)
    analyst_name = serializers.CharField(source='analyst.get_full_name', read_only=True)

    class Meta:
        model = AnalystQualificationRecord
        fields = [
            'id', 'qualification_id', 'analyst', 'analyst_name', 'technique', 'technique_name',
            'instrument', 'qualification_date', 'expiry_date', 'approved_by', 'status',
            'status_display', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'qualification_id', 'expiry_date', 'status', 'created_at', 'updated_at']
