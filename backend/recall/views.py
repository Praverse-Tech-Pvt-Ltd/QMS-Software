from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import RecallRecord
from .serializers import RecallRecordSerializer
from shared.workflow import transition
from shared.site_scoping import SiteScopedQuerysetMixin


class RecallRecordViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RecallRecordSerializer

    def get_queryset(self):
        qs = RecallRecord.objects.filter(is_active=True).order_by('-initiated_date')
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        recall = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        if not action_name:
            return Response({'error': 'action is required'}, status=400)
        try:
            transition(recall, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(RecallRecordSerializer(recall).data)

    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        qs = self.get_queryset().filter(status='active')
        return Response(RecallRecordSerializer(qs, many=True).data)
