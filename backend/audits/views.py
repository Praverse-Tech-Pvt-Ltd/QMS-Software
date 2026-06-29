from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Audit, Finding, AuditResponse
from .serializers import AuditSerializer, FindingSerializer, AuditResponseSerializer
from shared.workflow import transition


class AuditViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditSerializer

    def get_queryset(self):
        return Audit.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        audit = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')

        if not action_name:
            return Response({'error': 'action is required'}, status=400)

        try:
            transition(audit, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        return Response(AuditSerializer(audit).data)

    @action(detail=True, methods=['get', 'post'], url_path='findings')
    def findings(self, request, pk=None):
        audit = self.get_object()
        if request.method == 'GET':
            qs = Finding.objects.filter(audit=audit, is_active=True)
            return Response(FindingSerializer(qs, many=True).data)
        serializer = FindingSerializer(data=request.data)
        if serializer.is_valid():
            finding = serializer.save(
                audit=audit,
                created_by=request.user,
                modified_by=request.user,
            )
            # Auto-create CAPA for critical findings
            if finding.severity == 'critical':
                _auto_create_capa(finding, request.user)
            return Response(FindingSerializer(finding).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        audit = self.get_object()
        findings = Finding.objects.filter(audit=audit)
        return Response({
            'audit': AuditSerializer(audit).data,
            'findings': FindingSerializer(findings, many=True).data,
            'summary': {
                'total_findings': findings.count(),
                'critical': findings.filter(severity='critical').count(),
                'major': findings.filter(severity='major').count(),
                'minor': findings.filter(severity='minor').count(),
                'observations': findings.filter(severity='observation').count(),
            },
        })


def _auto_create_capa(finding, user):
    try:
        from quality.models import Capa
        from core.utils import generate_qms_id
        import datetime
        Capa.objects.create(
            title=f'CAPA for Critical Audit Finding: {finding.finding_number}',
            description=finding.description,
            action_type='CORRECTIVE',
            department=finding.audit.auditee_department,
            assigned_to=user,
            due_date=finding.due_date or (datetime.date.today() + datetime.timedelta(days=30)),
        )
    except Exception:
        pass
