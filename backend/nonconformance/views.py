from datetime import date, timedelta
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

from .models import NCReport, HoldRecord, Disposition
from .serializers import NCReportSerializer, DispositionSerializer
from shared.workflow import transition


class NCViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NCReportSerializer

    def get_queryset(self):
        return NCReport.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        nc = serializer.save(created_by=self.request.user, modified_by=self.request.user)
        # Auto-place on hold when NC is created
        HoldRecord.objects.create(nc=nc, placed_by=self.request.user, reason='Auto-hold on NC creation')

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='hold')
    def place_hold(self, request, pk=None):
        nc = self.get_object()
        HoldRecord.objects.create(
            nc=nc,
            placed_by=request.user,
            reason=request.data.get('reason', 'Hold placed by QA'),
        )
        nc.hold_status = True
        nc.save()
        return Response({'message': 'Hold placed', 'nc_number': nc.nc_number})

    @action(detail=True, methods=['post'], url_path='release-hold')
    def release_hold(self, request, pk=None):
        nc = self.get_object()
        esig_password = request.data.get('esig_password')
        from shared.workflow import verify_esignature
        try:
            verify_esignature(request.user, esig_password or '')
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        active_hold = HoldRecord.objects.filter(nc=nc, released_at__isnull=True).last()
        if active_hold:
            active_hold.released_by = request.user
            active_hold.released_at = timezone.now()
            active_hold.save()
        nc.hold_status = False
        nc.save()
        return Response({'message': 'Hold released'})

    @action(detail=True, methods=['post'], url_path='dispose')
    def dispose(self, request, pk=None):
        nc = self.get_object()
        esig_password = request.data.get('esig_password')
        decision = request.data.get('decision')
        justification = request.data.get('justification', '')

        if not decision:
            return Response({'error': 'decision is required'}, status=400)

        from shared.workflow import verify_esignature
        from shared.models import ESignature
        import hashlib

        try:
            verify_esignature(request.user, esig_password or '')
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        import hashlib
        esig = ESignature.objects.create(
            user=request.user,
            password_hash=hashlib.sha256((esig_password or '').encode()).hexdigest(),
            record_type='NCReport',
            record_id=str(nc.pk),
            action='dispose',
            meaning=f'I authorise the disposition of NC {nc.nc_number} as: {decision}',
        )

        disposition = Disposition.objects.create(
            nc=nc,
            decision=decision,
            decided_by=request.user,
            esignature=esig,
            justification=justification,
            created_by=request.user,
            modified_by=request.user,
        )
        nc.disposition = disposition
        transition(nc, 'dispositioned', request.user, f'Disposed as: {decision}')
        return Response(DispositionSerializer(disposition).data, status=201)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        nc = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(nc, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(NCReportSerializer(nc).data)


class NCTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        six_months_ago = date.today() - timedelta(days=180)
        data = (
            NCReport.objects
            .filter(created_at__gte=six_months_ago, is_active=True)
            .annotate(month=TruncMonth('created_at'))
            .values('month', 'defect_category', 'product')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        return Response(list(data))
