from rest_framework import serializers
from .models import TrainingPlan, TrainingAssignment
from accounts.serializers import UserSerializer

class TrainingAssignmentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = TrainingAssignment
        fields = '__all__'

class TrainingPlanSerializer(serializers.ModelSerializer):
    # assignments = TrainingAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingPlan
        fields = '__all__'