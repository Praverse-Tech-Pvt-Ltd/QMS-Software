from rest_framework import serializers
from .models import TrainingPlan, TrainingAssignment
from accounts.serializers import UserSerializer

class TrainingAssignmentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = TrainingAssignment
        fields = '__all__'

class TrainingPlanSerializer(serializers.ModelSerializer):
    total_trainees = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()

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
