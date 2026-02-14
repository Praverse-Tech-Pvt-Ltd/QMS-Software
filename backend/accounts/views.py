from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.response import Response
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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_employees(request):
    users = User.objects.all().values('id', 'first_name', 'last_name', 'role', 'department')
    return Response(list(users))