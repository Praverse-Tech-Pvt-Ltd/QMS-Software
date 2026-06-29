from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count

from .models import OOSInvestigation, OOSPhase1, OOSPhase2
from .oos_serializers import OOSInvestigationSerializer


class OOSInvestigationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OOSInvestigationSerializer

    def get_queryset(self):
        return OOSInvestigation.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            modified_by=self.request.user,
        )

    @action(detail=True, methods=['post'], url_path='phase1')
    def submit_phase1(self, request, pk=None):
        oos = self.get_object()
        if oos.phase != 'phase1':
            return Response({'error': 'Investigation is not in Phase 1'}, status=400)

        phase1, _ = OOSPhase1.objects.update_or_create(
            investigation=oos,
            defaults={
                'instrument_check': request.data.get('instrument_check', False),
                'analyst_retest_result': request.data.get('analyst_retest_result', ''),
                'calculation_error_found': request.data.get('calculation_error_found', False),
                'additional_notes': request.data.get('additional_notes', ''),
                'conclusion': request.data.get('conclusion', ''),
            },
        )

        conclusion = phase1.conclusion
        if conclusion == 'assignable_cause_found':
            oos.phase = 'invalidated'
            oos.invalidation_reason = request.data.get('invalidation_reason', phase1.additional_notes)
            oos.modified_by = request.user
            oos.save()
        elif conclusion == 'proceed_to_phase2':
            oos.phase = 'phase2'
            oos.modified_by = request.user
            oos.save()

        return Response(OOSInvestigationSerializer(oos).data)

    @action(detail=True, methods=['post'], url_path='phase2')
    def submit_phase2(self, request, pk=None):
        oos = self.get_object()
        if oos.phase != 'phase2':
            return Response({'error': 'Investigation is not in Phase 2'}, status=400)

        phase2, _ = OOSPhase2.objects.update_or_create(
            investigation=oos,
            defaults={
                'resampling_conducted': request.data.get('resampling_conducted', False),
                'additional_results': request.data.get('additional_results', []),
                'conclusion': request.data.get('conclusion', ''),
                'qa_review_notes': request.data.get('qa_review_notes', ''),
            },
        )

        conclusion = phase2.conclusion
        if conclusion in ('confirmed_oos', 'invalidated'):
            oos.phase = conclusion
            oos.modified_by = request.user
            oos.save()

        return Response(OOSInvestigationSerializer(oos).data)


class OOSStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = OOSInvestigation.objects.count()
        open_count = OOSInvestigation.objects.filter(phase__in=['phase1', 'phase2']).count()
        confirmed = OOSInvestigation.objects.filter(phase='confirmed_oos').count()
        oos_rate = round((confirmed / total * 100) if total > 0 else 0, 1)

        return Response({
            'open_count': open_count,
            'confirmed_oos': confirmed,
            'oos_rate_percent': oos_rate,
            'total': total,
        })
