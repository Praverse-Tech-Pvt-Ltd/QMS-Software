from datetime import date, timedelta

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document, DocumentVersion
from .serializers import DocumentSerializer, DocumentVersionSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-updated_at')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'document_id'

    # Custom Action: Upload a new version for a document
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_version(self, request, pk=None):
        document = self.get_object()

        # Manually create the version
        serializer = DocumentVersionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(document=document, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='review-due')
    def review_due(self, request):
        threshold = date.today() + timedelta(days=30)
        qs = self.get_queryset().filter(
            next_review_date__lte=threshold,
            status=Document.Status.EFFECTIVE,
        )
        return Response(DocumentSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='mark-reviewed')
    def mark_reviewed(self, request, document_id=None):
        document = self.get_object()
        document.mark_reviewed()
        return Response(DocumentSerializer(document).data)