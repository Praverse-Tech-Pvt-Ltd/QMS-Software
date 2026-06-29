from rest_framework import serializers
from .models import Audit, Finding, AuditResponse


class FindingSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Finding
        fields = [
            'id', 'finding_number', 'severity', 'severity_display',
            'description', 'reference_clause', 'due_date', 'capa',
            'status', 'status_display', 'created_at',
        ]
        read_only_fields = ['id', 'finding_number', 'created_at']


class AuditResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditResponse
        fields = ['id', 'finding', 'response_text', 'accepted_by_lead', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuditSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_auditor_name = serializers.CharField(source='lead_auditor.get_full_name', read_only=True)
    findings_count = serializers.SerializerMethodField()
    open_findings = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = [
            'id', 'audit_number', 'type', 'type_display', 'scope',
            'lead_auditor', 'lead_auditor_name', 'co_auditors',
            'auditee_department', 'criteria', 'scheduled_date', 'actual_date',
            'status', 'status_display', 'closure_remark',
            'created_at', 'updated_at', 'findings_count', 'open_findings',
        ]
        read_only_fields = ['id', 'audit_number', 'created_at', 'updated_at']

    def get_findings_count(self, obj):
        return obj.findings.filter(is_active=True).count()

    def get_open_findings(self, obj):
        return obj.findings.filter(status='open', is_active=True).count()
