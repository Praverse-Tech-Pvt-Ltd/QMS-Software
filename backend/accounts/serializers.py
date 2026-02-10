from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department', 'employee_id']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT response to include user role and details 
    so the frontend can auto-login and set permissions immediately.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # ✅ Add these fields so React context can update immediately
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['department'] = self.user.department
        # data['refresh'] and data['access'] are already added by super()
        
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        # ✅ FIX: Use User.Role.VIEWER to match the model definition exactly
        # This ensures the role is saved as "Viewer", not "VIEWER"
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            role=User.Role.VIEWER  # Uses the value "Viewer" from your model
        )
        return user