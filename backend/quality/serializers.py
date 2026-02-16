from rest_framework import serializers

from core.models import AuditLog
from .models import Deviation
from accounts.serializers import UserSerializer
from .models import Deviation, Capa, ChangeControl

class AuditLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = AuditLog # Ensure you have this model
        fields = ['id', 'action', 'details', 'timestamp', 'user_details']
        
class DeviationSerializer(serializers.ModelSerializer):
    raised_by_details = UserSerializer(source='raised_by', read_only=True)

    class Meta:
        model = Deviation
        fields = [
            'id', 'deviation_id', 'title', 'description', 
            'risk_level', 'status', 'department', 
            'raised_by', 'raised_by_details', 'occurrence_date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['deviation_id', 'raised_by', 'created_at', 'updated_at','status']
    def create(self, validated_data):
        # Auto-assign the user creating the record
        request = self.context.get('request')
        validated_data['raised_by'] = request.user
        return super().create(validated_data)
    
class CapaSerializer(serializers.ModelSerializer):
    audit_trail = AuditLogSerializer(many=True, read_only=True)
    signatures = serializers.SerializerMethodField()

    class Meta:
        model = Capa
        # Explicitly list fields to ensure RCA and Action Plan are included
        fields = [
            'id', 'capa_id', 'title', 'description', 'status', 
            'action_type', 'due_date', 'root_cause', 'action_plan',
            'audit_trail', 'signatures'
        ]
        read_only_fields = ['capa_id', 'created_at', 'status']

    def get_signatures(self, obj):
        # Fetch linked e-signatures for this record
        return [] # Placeholder until E-Sign model is ready
        
class ChangeControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeControl
        fields = '__all__'
        read_only_fields = ['cc_id', 'created_at', 'status', 'initiator']