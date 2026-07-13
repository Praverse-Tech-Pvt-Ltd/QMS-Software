from datetime import date, timedelta

from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import InventoryCategory, InventoryItem, InventoryLot, InventoryUsageLog
from .serializers import (
    InventoryCategorySerializer,
    InventoryItemSerializer,
    InventoryLotSerializer,
    InventoryUsageLogSerializer,
)
from shared.site_scoping import SiteScopedQuerysetMixin

EXPIRY_WINDOW_DAYS = 30


class InventoryCategoryViewSet(viewsets.ModelViewSet):
    """Plain lookup table — not site-scoped, not a BaseModel subclass."""
    permission_classes = [IsAuthenticated]
    serializer_class = InventoryCategorySerializer
    queryset = InventoryCategory.objects.all()


class InventoryItemViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        qs = InventoryItem.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        """Items whose total in-use quantity across active lots is below minimum_stock."""
        low = []
        qs = self.get_queryset().filter(minimum_stock__isnull=False)
        for item in qs:
            total = InventoryLot.objects.filter(
                item=item, status='in_use', is_active=True,
            ).aggregate(t=Sum('current_quantity'))['t'] or 0
            if total < item.minimum_stock:
                data = InventoryItemSerializer(item).data
                data['total_in_use'] = total
                low.append(data)
        return Response(low)


class InventoryLotViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InventoryLotSerializer

    def get_queryset(self):
        qs = InventoryLot.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(created_by=self.request.user, modified_by=self.request.user, site=site)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='usage')
    def usage(self, request, pk=None):
        lot = self.get_object()
        if request.method == 'GET':
            qs = lot.usage_logs.filter(is_active=True)
            return Response(InventoryUsageLogSerializer(qs, many=True).data)

        serializer = InventoryUsageLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        site = getattr(request.user, 'site', None)
        serializer.save(
            lot=lot,
            used_by=request.user,
            created_by=request.user,
            modified_by=request.user,
            site=site,
        )
        return Response(serializer.data, status=201)

    @action(detail=False, methods=['get'], url_path='expiring')
    def expiring(self, request):
        threshold = date.today() + timedelta(days=EXPIRY_WINDOW_DAYS)
        qs = self.get_queryset().filter(expiry_date__lte=threshold, status='in_use')
        return Response(InventoryLotSerializer(qs, many=True).data)


class InventoryUsageLogViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InventoryUsageLogSerializer

    def get_queryset(self):
        qs = InventoryUsageLog.objects.filter(is_active=True)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        site = getattr(self.request.user, 'site', None)
        serializer.save(
            used_by=self.request.user,
            created_by=self.request.user,
            modified_by=self.request.user,
            site=site,
        )

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)
