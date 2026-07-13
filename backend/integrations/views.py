from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import IntegrationConfig, IntegrationSyncLog
from .serializers import IntegrationConfigSerializer, IntegrationSyncLogSerializer
from .adapters.factory import get_erp_adapter


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    """
    Manage ERP integration configs. The admin-only restriction is enforced
    entirely on the frontend, same as this app's design for other
    settings-style pages (e.g. site management) — any authenticated user can
    reach this endpoint, but only the Admin role gets the UI to use it.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = IntegrationConfigSerializer
    queryset = IntegrationConfig.objects.all()

    @action(detail=False, methods=['post'], url_path='fetch-material')
    def fetch_material(self, request):
        code = request.query_params.get('code', '')
        try:
            data = get_erp_adapter().get_material_master(code)
        except Exception:
            data = {}
        return Response(data)

    @action(detail=False, methods=['post'], url_path='fetch-batch')
    def fetch_batch(self, request):
        batch = request.query_params.get('batch', '')
        try:
            data = get_erp_adapter().get_batch_info(batch)
        except Exception:
            data = {}
        return Response(data)


class IntegrationSyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = IntegrationSyncLogSerializer
    queryset = IntegrationSyncLog.objects.all()
