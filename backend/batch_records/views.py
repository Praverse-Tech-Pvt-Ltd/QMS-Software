from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MasterBatchRecord, BatchProductionRecord
from .serializers import MasterBatchRecordSerializer, BatchProductionRecordSerializer
from shared.workflow import transition
from shared.site_scoping import SiteScopedQuerysetMixin
from integrations.adapters.factory import get_erp_adapter


class MasterBatchRecordViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MasterBatchRecordSerializer

    def get_queryset(self):
        qs = MasterBatchRecord.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        mbr = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(mbr, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(MasterBatchRecordSerializer(mbr).data)


class BatchProductionRecordViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BatchProductionRecordSerializer

    def get_queryset(self):
        qs = BatchProductionRecord.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        bpr = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(bpr, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(BatchProductionRecordSerializer(bpr).data)

    @action(detail=False, methods=['get'], url_path='erp-prefill')
    def erp_prefill(self, request):
        """
        Best-effort ERP lookup the frontend can call before submitting the
        create form. Never raises — ERP connectivity must never block record
        creation, so any adapter failure just yields an empty result.
        """
        batch = request.query_params.get('batch', '')
        try:
            data = get_erp_adapter().get_batch_info(batch)
        except Exception:
            data = {}
        return Response(data)
