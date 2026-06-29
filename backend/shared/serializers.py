from rest_framework import serializers
from core.models import AuditLog
from django.contrib.contenttypes.models import ContentType
from .models import ActionItem


class BaseSerializer(serializers.ModelSerializer):
    """
    Base serializer that injects audit_trail and created_by_detail
    into any regulated model response.
    """
    created_by_detail = serializers.SerializerMethodField()
    audit_trail = serializers.SerializerMethodField()

    def get_created_by_detail(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'role': obj.created_by.role,
            }
        return None

    def get_audit_trail(self, obj):
        content_type = ContentType.objects.get_for_model(obj.__class__)
        logs = AuditLog.objects.filter(
            content_type=content_type,
            object_id=str(obj.pk),
        ).order_by('-timestamp')[:50]
        return [
            {
                'action': log.action,
                'user': log.user_email,
                'timestamp': log.timestamp.isoformat(),
                'reason': log.reason,
                'changes': log.changes,
            }
            for log in logs
        ]


class ActionItemSerializer(serializers.ModelSerializer):
    assigned_to_detail = serializers.SerializerMethodField()

    class Meta:
        model = ActionItem
        fields = [
            'id', 'record_type', 'record_id', 'action', 'category',
            'suggested_owner_role', 'assigned_to', 'assigned_to_detail',
            'due_date', 'status', 'evidence_note', 'extension_reason',
            'source_remark', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_to_detail(self, obj):
        if obj.assigned_to:
            return {
                'id': str(obj.assigned_to.id),
                'username': obj.assigned_to.username,
                'full_name': obj.assigned_to.get_full_name(),
            }
        return None
