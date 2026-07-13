from datetime import date, timedelta

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StabilityProtocol, StabilityPullPoint
from .serializers import StabilityProtocolSerializer, StabilityPullPointSerializer
from shared.workflow import transition


class StabilityProtocolViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StabilityProtocolSerializer

    def get_queryset(self):
        return StabilityProtocol.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        protocol = serializer.save(created_by=self.request.user, modified_by=self.request.user)
        protocol.generate_pull_points()

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        protocol = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        if not action_name:
            return Response({'error': 'action is required'}, status=400)
        try:
            transition(protocol, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(StabilityProtocolSerializer(protocol).data)

    @action(detail=True, methods=['get'], url_path='pull-points')
    def pull_points(self, request, pk=None):
        protocol = self.get_object()
        qs = protocol.pull_points.filter(is_active=True)
        return Response(StabilityPullPointSerializer(qs, many=True).data)


class StabilityPullPointViewSet(viewsets.ModelViewSet):
    """
    Read/update access to individual pull points — recording actual_date/status
    when a sample is pulled, linking the laboratory Sample, flagging OOT results,
    and saving back an AI-drafted remark. Pull points themselves are only created
    via StabilityProtocol.generate_pull_points() (auto, on protocol creation).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StabilityPullPointSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return StabilityPullPoint.objects.filter(is_active=True).order_by('scheduled_date')

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='upcoming')
    def upcoming(self, request):
        threshold = date.today() + timedelta(days=30)
        qs = self.get_queryset().filter(
            status='pending',
            scheduled_date__lte=threshold,
        )
        return Response(StabilityPullPointSerializer(qs, many=True).data)
