from datetime import date
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.db.models.functions import TruncMonth

from .models import Complaint, MDRReport
from .serializers import ComplaintSerializer
from shared.workflow import transition


class ComplaintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(is_active=True).order_by('-received_date')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        complaint = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(complaint, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(ComplaintSerializer(complaint).data)

    @action(detail=True, methods=['post'], url_path='flag-mdr')
    def flag_mdr(self, request, pk=None):
        complaint = self.get_object()
        role = getattr(request.user, 'role', '')
        if role not in ('Admin', 'QA', 'QA Head', 'QA Manager', 'QA Executive'):
            return Response({'error': 'Insufficient permissions'}, status=403)
        complaint.regulatory_reportable = True
        complaint.save()
        mdr = MDRReport.objects.create(
            complaint=complaint,
            created_by=request.user,
            modified_by=request.user,
        )
        return Response({'mdr_id': str(mdr.id), 'message': 'Complaint flagged for MDR reporting'})


class OverdueComplaintsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        qs = Complaint.objects.filter(
            is_active=True,
            response_deadline__lt=today,
        ).exclude(status='closed')
        serializer = ComplaintSerializer(qs, many=True)
        return Response({'count': qs.count(), 'results': serializer.data})


class ComplaintTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        twelve_months_ago = date.today().replace(day=1) - timedelta(days=365)
        data = (
            Complaint.objects
            .filter(received_date__gte=twelve_months_ago, is_active=True)
            .annotate(month=TruncMonth('received_date'))
            .values('month', 'severity')
            .annotate(count=Count('id'))
            .order_by('month', 'severity')
        )
        return Response(list(data))
