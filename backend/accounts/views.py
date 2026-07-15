from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Site
from .serializers import (
    ChangePasswordSerializer, CustomTokenObtainPairSerializer, RegisterSerializer, SiteSerializer,
)

User = get_user_model()


class SiteViewSet(viewsets.ModelViewSet):
    """
    Site management (Phase 6 Block 7). Any authenticated user can list sites
    (needed to populate the nav site selector); only Admin can create/edit —
    matches the QA-staff-role-gating pattern already used elsewhere
    (e.g. knowledge.views.SOPUploadView).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SiteSerializer
    queryset = Site.objects.all().order_by('name')

    def _is_admin(self, request):
        return getattr(request.user, 'role', '') == 'Admin'

    def create(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can create sites'}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can edit sites'}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can edit sites'}, status=403)
        return super().partial_update(request, *args, **kwargs)


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


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/auth/change-password/ — 21 CFR Part 11 section 11.300(b)."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
