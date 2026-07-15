from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Site

User = get_user_model()

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'name', 'code', 'country', 'is_active']
        read_only_fields = ['id']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department', 'employee_id', 'site']

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
        data['site'] = self.user.site_id
        data['site_name'] = self.user.site.name if self.user.site_id else None
        data['must_change_password'] = self.user.must_change_password
        # data['refresh'] and data['access'] are already added by super()

        return data

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        validate_password(value, user=user)
        return value

    def save(self):
        from django.utils import timezone

        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.password_changed_at = timezone.now()
        user.must_change_password = False
        user.save(update_fields=['password', 'password_changed_at', 'must_change_password'])
        return user


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