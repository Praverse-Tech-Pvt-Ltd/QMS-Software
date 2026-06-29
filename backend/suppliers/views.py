from datetime import date, timedelta
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Supplier, QualificationRecord, ASLEntry
from .serializers import SupplierSerializer, QualificationSerializer, ASLEntrySerializer
from shared.workflow import transition


class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupplierSerializer

    def get_queryset(self):
        qs = Supplier.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        if category:
            qs = qs.filter(category=category)
        if status:
            qs = qs.filter(status=status)
        return qs.order_by('name')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        supplier = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(supplier, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(SupplierSerializer(supplier).data)

    @action(detail=True, methods=['post'], url_path='scn')
    def scn(self, request, pk=None):
        from .models import SupplierChangeNotification
        supplier = self.get_object()
        scn = SupplierChangeNotification.objects.create(
            supplier=supplier,
            description=request.data.get('description', ''),
            received_date=request.data.get('received_date', date.today().isoformat()),
            created_by=request.user,
            modified_by=request.user,
        )
        return Response({'id': str(scn.id), 'message': 'SCN created'}, status=201)

    @action(detail=True, methods=['get', 'post'], url_path='qualifications')
    def qualifications(self, request, pk=None):
        supplier = self.get_object()
        if request.method == 'GET':
            qs = QualificationRecord.objects.filter(supplier=supplier, is_active=True)
            return Response(QualificationSerializer(qs, many=True).data)
        serializer = QualificationSerializer(data=request.data)
        if serializer.is_valid():
            qual = serializer.save(
                supplier=supplier,
                created_by=request.user,
                modified_by=request.user,
            )
            return Response(QualificationSerializer(qual).data, status=201)
        return Response(serializer.errors, status=400)


class ASLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            current = ASLEntry.objects.get(is_current=True)
            return Response(ASLEntrySerializer(current).data)
        except ASLEntry.DoesNotExist:
            return Response({'message': 'No current ASL exists'}, status=404)


class ExpiringSupplierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cutoff = date.today() + timedelta(days=30)
        qs = Supplier.objects.filter(
            is_active=True,
            status='qualified',
            expiry_date__lte=cutoff,
        ).order_by('expiry_date')
        serializer = SupplierSerializer(qs, many=True)
        return Response({'count': qs.count(), 'results': serializer.data})
