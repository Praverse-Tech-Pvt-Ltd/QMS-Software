from datetime import date
from rest_framework import serializers
from .models import Supplier, QualificationRecord, ASLEntry


class SupplierSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    days_to_expiry = serializers.SerializerMethodField()
    expiry_status = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'supplier_code', 'name', 'category', 'category_display',
            'country', 'status', 'status_display', 'approved_materials',
            'qualification_date', 'expiry_date', 'contact_name', 'contact_email',
            'created_at', 'updated_at', 'days_to_expiry', 'expiry_status',
        ]
        read_only_fields = ['id', 'supplier_code', 'created_at', 'updated_at']

    def get_days_to_expiry(self, obj):
        if obj.expiry_date:
            return (obj.expiry_date - date.today()).days
        return None

    def get_expiry_status(self, obj):
        days = self.get_days_to_expiry(obj)
        if days is None:
            return 'no_expiry'
        if days < 0:
            return 'expired'
        if days <= 30:
            return 'expiring_soon'
        return 'valid'


class QualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualificationRecord
        fields = [
            'id', 'qualification_type', 'start_date', 'completion_date',
            'qualified_by', 'status', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ASLEntrySerializer(serializers.ModelSerializer):
    suppliers = SupplierSerializer(many=True, read_only=True)

    class Meta:
        model = ASLEntry
        fields = ['id', 'version', 'effective_date', 'approved_by', 'is_current', 'suppliers', 'created_at']
