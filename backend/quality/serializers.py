from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from core.models import AuditLog
from accounts.serializers import UserSerializer
from .models import Deviation, Capa, ChangeControl, CapaAction

class AuditLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'reason', 'changes', 'timestamp', 'user_details']

class CapaActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapaAction
        fields = ['id', 'description', 'owner', 'due_date', 'status']

class CapaSerializer(serializers.ModelSerializer):
    # actions and audit_trail must be defined above this or as strings
    actions = CapaActionSerializer(many=True, read_only=True)
    audit_trail = serializers.SerializerMethodField()
    signatures = serializers.SerializerMethodField()

    class Meta:
        model = Capa
        fields = [
            'id', 'capa_id', 'title', 'description', 'status', 
            'action_type', 'due_date', 'root_cause', 'action_plan',
            'audit_trail', 'signatures', 'actions'
        ]
        read_only_fields = ['capa_id', 'created_at', 'status']

    def get_audit_trail(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        logs = AuditLog.objects.filter(content_type=content_type, object_id=obj.id).order_by('-timestamp')
        return AuditLogSerializer(logs, many=True).data

    def get_signatures(self, obj):
        return [] # Placeholder

class DeviationSerializer(serializers.ModelSerializer):
    raised_by_details = UserSerializer(source='raised_by', read_only=True)
    # ✅ Now that CapaSerializer is defined above, this works perfectly
    capas = CapaSerializer(many=True, read_only=True)
    audit_trail = serializers.SerializerMethodField()

    class Meta:
        model = Deviation
        fields = [
            'id', 'deviation_id', 'title', 'description', 
            'risk_level', 'status', 'department', 
            'raised_by', 'raised_by_details', 'occurrence_date', 
            'created_at', 'updated_at', 'capas', 'audit_trail',
            'immediate_actions', 'root_cause'
        ]
        read_only_fields = ['deviation_id', 'raised_by', 'created_at', 'updated_at', 'status']

    def get_audit_trail(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        logs = AuditLog.objects.filter(content_type=content_type, object_id=obj.id).order_by('-timestamp')
        return AuditLogSerializer(logs, many=True).data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['raised_by'] = request.user
        return super().create(validated_data)

class ChangeControlSerializer(serializers.ModelSerializer):
    audit_trail = serializers.SerializerMethodField()

    class Meta:
        model = ChangeControl
        fields = '__all__'
        read_only_fields = ['cc_id', 'created_at', 'status', 'initiator']

    def get_audit_trail(self, obj):
        from core.models import AuditLog
        from django.contrib.contenttypes.models import ContentType
        # Fetch logs for this specific Change Control record
        ct = ContentType.objects.get_for_model(obj)
        logs = AuditLog.objects.filter(content_type=ct, object_id=obj.id).order_by('-timestamp')
        return AuditLogSerializer(logs, many=True).data