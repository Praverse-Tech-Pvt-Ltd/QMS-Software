from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer

User = get_user_model()


class CustomLoginView(TokenObtainPairView):
    """Login: returns access token in body, sets refresh token as HttpOnly cookie."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh_token = response.data.pop("refresh", None)
            if refresh_token:
                response.set_cookie(
                    key="refresh_token",
                    value=str(refresh_token),
                    httponly=True,
                    secure=not __import__("django.conf", fromlist=["settings"]).settings.DEBUG,
                    samesite="Lax",
                    max_age=7 * 24 * 3600,
                    path="/api/auth/token/refresh/",
                )
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Refresh access token using HttpOnly cookie — no refresh token in request body needed."""

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token not found."}, status=status.HTTP_401_UNAUTHORIZED)
        # Inject the cookie value into the request data for simplejwt to process
        request.data["refresh"] = refresh_token
        return super().post(request, *args, **kwargs)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_employees(request):
    users = User.objects.all().values("id", "first_name", "last_name", "role", "department")
    return Response(list(users))
