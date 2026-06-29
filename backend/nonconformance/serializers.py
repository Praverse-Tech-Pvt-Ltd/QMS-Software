from datetime import date, timedelta
from rest_framework import serializers
from .models import NCReport, HoldRecord, Disposition


class HoldRecordSerializer(serializers.ModelSerializer):
    placed_by_name = serializers.CharField(source='placed_by.get_full_name', read_only=True)

    class Meta:
        model = HoldRecord
        fields = ['id', 'placed_by', 'placed_by_name', 'placed_at', 'released_by', 'released_at', 'reason']


class DispositionSerializer(serializers.ModelSerializer):
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)

    class Meta:
        model = Disposition
        fields = ['id', 'decision', 'decision_display', 'decided_by', 'decided_at', 'justification']
        read_only_fields = ['id', 'decided_at']


class NCReportSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_repeat = serializers.SerializerMethodField()
    active_hold = serializers.SerializerMethodField()

    class Meta:
        model = NCReport
        fields = [
            'id', 'nc_number', 'product', 'batch_lot',
            'quantity_affected', 'unit', 'defect_description', 'defect_category',
            'severity', 'severity_display', 'hold_status', 'status', 'status_display',
            'linked_capa', 'created_at', 'updated_at', 'is_repeat', 'active_hold',
        ]
        read_only_fields = ['id', 'nc_number', 'created_at', 'updated_at']

    def get_is_repeat(self, obj):
        six_months_ago = date.today() - timedelta(days=180)
        return NCReport.objects.filter(
            product=obj.product,
            defect_category=obj.defect_category,
            created_at__gte=six_months_ago,
            is_active=True,
        ).exclude(pk=obj.pk).exists()

    def get_active_hold(self, obj):
        hold = obj.holds.filter(released_at__isnull=True).last()
        if hold:
            return HoldRecordSerializer(hold).data
        return None
