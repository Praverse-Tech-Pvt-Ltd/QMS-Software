from rest_framework import serializers
from .models import Deviation
from accounts.serializers import UserSerializer
from .models import Deviation, Capa, ChangeControl

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
    class Meta:
        model = Capa
        fields = '__all__'
        read_only_fields = ['capa_id', 'created_at', 'status']
        
class ChangeControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeControl
        fields = '__all__'
        read_only_fields = ['cc_id', 'created_at', 'status', 'initiator']