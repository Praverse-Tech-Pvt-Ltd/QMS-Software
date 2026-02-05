from rest_framework import serializers
from .models import Document, DocumentVersion
from accounts.serializers import UserSerializer # Ensure this import works!

class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = ['id', 'version_number', 'file', 'change_log', 'created_at', 'created_by']
        read_only_fields = ['created_by', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    latest_version = serializers.SerializerMethodField()
    owner_details = UserSerializer(source='owner', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'document_id', 'doc_type', 'status', 'department', 'owner', 'owner_details', 'latest_version', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at', 'document_id']

    def get_latest_version(self, obj):
        latest = obj.versions.order_by('-created_at').first()
        if latest:
            return DocumentVersionSerializer(latest).data
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['owner'] = request.user
        return super().create(validated_data)