import hashlib

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Logbook, LogbookEntry
from .serializers import LogbookSerializer, LogbookEntrySerializer
from shared.models import ESignature
from shared.workflow import verify_esignature


class LogbookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LogbookSerializer

    def get_queryset(self):
        return Logbook.objects.filter(is_active=True).order_by('name')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='entries')
    def entries(self, request, pk=None):
        logbook = self.get_object()

        if request.method == 'GET':
            qs = LogbookEntry.objects.filter(logbook=logbook, is_active=True)
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            if date_from:
                qs = qs.filter(entry_date__gte=date_from)
            if date_to:
                qs = qs.filter(entry_date__lte=date_to)
            return Response(LogbookEntrySerializer(qs, many=True).data)

        esig_password = request.data.get('esig_password')
        try:
            verify_esignature(request.user, esig_password or '')
        except Exception as e:
            return Response({'error': str(e)}, status=400)

        serializer = LogbookEntrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        esig = ESignature.objects.create(
            user=request.user,
            password_hash=hashlib.sha256((esig_password or '').encode()).hexdigest(),
            record_type='LogbookEntry',
            record_id=str(logbook.pk),
            action='create_entry',
            meaning=f'I attest this logbook entry for {logbook.name} is accurate and complete.',
        )

        entry = serializer.save(
            logbook=logbook,
            performed_by=request.user,
            esignature=esig,
            created_by=request.user,
            modified_by=request.user,
        )
        return Response(LogbookEntrySerializer(entry).data, status=201)


class LogbookEntryViewSet(viewsets.ModelViewSet):
    """
    Read/update access to individual entries — e.g. PATCH ai_remark_draft after
    the frontend fetches an AI-drafted remark for an abnormal entry. Entries are
    created only via LogbookViewSet.entries() so the e-signature is enforced.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LogbookEntrySerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return LogbookEntry.objects.filter(is_active=True).order_by('-entry_date', '-entry_time')

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)
