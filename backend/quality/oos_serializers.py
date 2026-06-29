from rest_framework import serializers
from .models import OOSInvestigation, OOSPhase1, OOSPhase2


class OOSPhase1Serializer(serializers.ModelSerializer):
    class Meta:
        model = OOSPhase1
        fields = ['instrument_check', 'analyst_retest_result', 'calculation_error_found', 'additional_notes', 'conclusion']


class OOSPhase2Serializer(serializers.ModelSerializer):
    class Meta:
        model = OOSPhase2
        fields = ['resampling_conducted', 'additional_results', 'conclusion', 'qa_review_notes']


class OOSInvestigationSerializer(serializers.ModelSerializer):
    phase_display = serializers.CharField(source='get_phase_display', read_only=True)
    phase1 = OOSPhase1Serializer(read_only=True)
    phase2 = OOSPhase2Serializer(read_only=True)

    class Meta:
        model = OOSInvestigation
        fields = [
            'id', 'oos_number', 'product', 'batch_lot', 'test_name',
            'specification', 'result_obtained', 'phase', 'phase_display',
            'assignable_cause', 'invalidation_reason', 'linked_capa',
            'created_at', 'phase1', 'phase2',
        ]
        read_only_fields = ['id', 'oos_number', 'created_at']
