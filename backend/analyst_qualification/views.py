from datetime import date, timedelta

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from shared.site_scoping import SiteScopedQuerysetMixin
from shared.workflow import transition

from .models import AnalyticalTechnique, AnalystQualificationRecord
from .serializers import AnalyticalTechniqueSerializer, AnalystQualificationRecordSerializer


class AnalyticalTechniqueViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnalyticalTechniqueSerializer

    def get_queryset(self):
        qs = AnalyticalTechnique.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)


class AnalystQualificationRecordViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnalystQualificationRecordSerializer

    def get_queryset(self):
        qs = AnalystQualificationRecord.objects.filter(is_active=True).select_related(
            'analyst', 'technique', 'instrument', 'approved_by',
        )
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        obj = self.get_object()
        try:
            transition(obj, request.data.get('action'), request.user, request.data.get('reason', ''), request.data.get('esig_password'))
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        if obj.status == 'qualified':
            obj.approved_by = request.user
            obj.save(update_fields=['approved_by', 'updated_at'])
        return Response(AnalystQualificationRecordSerializer(obj).data)

    @action(detail=False, methods=['get'], url_path='expiring')
    def expiring(self, request):
        threshold = date.today() + timedelta(days=30)
        qs = self.get_queryset().filter(expiry_date__lte=threshold, status='qualified')
        return Response(AnalystQualificationRecordSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='matrix')
    def matrix(self, request):
        """
        Builds {analyst_id: {technique_id: {status, expiry_date}}} from all
        AnalystQualificationRecord rows visible to this user (site-scoped).
        Where an analyst/technique pair has more than one record (distinct
        instruments), the most recently created one wins.
        """
        qs = self.get_queryset().order_by('analyst_id', 'technique_id', '-created_at')
        result: dict = {}
        for record in qs:
            analyst_key = str(record.analyst_id)
            technique_key = str(record.technique_id)
            techniques = result.setdefault(analyst_key, {})
            if technique_key in techniques:
                continue
            techniques[technique_key] = {
                'status': record.status,
                'expiry_date': record.expiry_date,
            }
        return Response(result)
