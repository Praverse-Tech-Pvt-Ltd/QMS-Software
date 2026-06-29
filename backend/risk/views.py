from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count

from .models import Risk, Mitigation, ResidualRisk
from .serializers import RiskSerializer, MitigationSerializer
from shared.workflow import transition


class RiskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RiskSerializer

    def get_queryset(self):
        qs = Risk.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        if category:
            qs = qs.filter(category=category)
        if status:
            qs = qs.filter(status=status)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='mitigate')
    def mitigate(self, request, pk=None):
        risk = self.get_object()
        serializer = MitigationSerializer(data=request.data)
        if serializer.is_valid():
            mitigation = serializer.save(
                risk=risk,
                created_by=request.user,
                modified_by=request.user,
            )
            return Response(MitigationSerializer(mitigation).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], url_path='reassess')
    def reassess(self, request, pk=None):
        risk = self.get_object()
        residual_severity = request.data.get('residual_severity')
        residual_occurrence = request.data.get('residual_occurrence')
        residual_detection = request.data.get('residual_detection')

        if not all([residual_severity, residual_occurrence, residual_detection]):
            return Response({'error': 'residual_severity, residual_occurrence, residual_detection required'}, status=400)

        residual, created = ResidualRisk.objects.update_or_create(
            risk=risk,
            defaults={
                'residual_severity': residual_severity,
                'residual_occurrence': residual_occurrence,
                'residual_detection': residual_detection,
                'assessed_by': request.user,
            },
        )
        return Response({
            'residual_rpn': residual.residual_rpn,
            'created': created,
        })

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        risk = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(risk, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(RiskSerializer(risk).data)


class RiskMatrixView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 5x5 matrix indexed [severity-1][occurrence-1] = count
        matrix = [[0] * 5 for _ in range(5)]
        risks = Risk.objects.filter(is_active=True, status='open')
        for risk in risks:
            s = min(max(risk.severity - 1, 0), 4)
            o = min(max(risk.occurrence - 1, 0), 4)
            matrix[s][o] += 1

        return Response({
            'matrix': matrix,
            'total': risks.count(),
            'by_level': {
                'low': risks.filter(severity__lte=2, occurrence__lte=2).count(),
                'medium': risks.filter(severity__lte=3, occurrence__lte=3).count(),
                'high': risks.filter(severity__gte=4).count() + risks.filter(occurrence__gte=4).count(),
            },
        })
