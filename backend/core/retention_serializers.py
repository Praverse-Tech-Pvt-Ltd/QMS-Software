from rest_framework import serializers
from .models import RetentionPolicy


class RetentionPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = RetentionPolicy
        fields = ['id', 'record_type', 'retention_years', 'regulatory_basis', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
