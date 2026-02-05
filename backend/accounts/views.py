from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics,permissions
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]