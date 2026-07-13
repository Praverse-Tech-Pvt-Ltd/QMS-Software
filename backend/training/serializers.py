from rest_framework import serializers
from .models import TrainingPlan, TrainingAssignment, SCORMModule, SCORMResult
from accounts.serializers import UserSerializer

class TrainingAssignmentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = TrainingAssignment
        fields = '__all__'

class SCORMModuleSerializer(serializers.ModelSerializer):
    version_display = serializers.CharField(source='get_version_display', read_only=True)

    class Meta:
        model = SCORMModule
        fields = [
            'id', 'training_plan', 'title', 'version', 'version_display',
            'package_file', 'launch_url', 'completion_threshold',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SCORMResultSerializer(serializers.ModelSerializer):
    completion_status_display = serializers.CharField(source='get_completion_status_display', read_only=True)

    class Meta:
        model = SCORMResult
        fields = [
            'id', 'scorm_module', 'assignment', 'score', 'completion_status',
            'completion_status_display', 'raw_data', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TrainingPlanSerializer(serializers.ModelSerializer):
    total_trainees = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    scorm_module = SCORMModuleSerializer(read_only=True)

    class Meta:
        model = TrainingPlan
        fields = '__all__'

    def get_total_trainees(self, obj):
        return obj.assignments.count()

    def get_completion_rate(self, obj):
        total = obj.assignments.count()
        if total == 0:
            return 0
        completed = obj.assignments.filter(status='COMPLETED').count()
        return round((completed / total) * 100)
