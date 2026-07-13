from datetime import date, timedelta

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EMSamplingPlan, EMResult
from .serializers import EMSamplingPlanSerializer, EMResultSerializer
from shared.site_scoping import SiteScopedQuerysetMixin


class EMSamplingPlanViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EMSamplingPlanSerializer

    def get_queryset(self):
        qs = EMSamplingPlan.objects.filter(is_active=True).order_by('area')
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)


class EMResultViewSet(SiteScopedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EMResultSerializer

    def get_queryset(self):
        qs = EMResult.objects.filter(is_active=True).order_by('-sampling_date')
        area = self.request.query_params.get('area')
        if area:
            qs = qs.filter(sampling_plan__area=area)
        return self.scope_by_site(qs)

    def perform_create(self, serializer):
        serializer.save(sampled_by=self.request.user, created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='trends')
    def trends(self, request):
        area = request.query_params.get('area')
        if not area:
            return Response({'error': 'area parameter is required'}, status=400)

        months = int(request.query_params.get('months', 6))
        cutoff = date.today() - timedelta(days=months * 30)

        qs = EMResult.objects.filter(
            sampling_plan__area=area, sampling_date__gte=cutoff, is_active=True,
        ).order_by('sampling_date')

        monitoring_type = request.query_params.get('monitoring_type')
        if monitoring_type:
            qs = qs.select_related('sampling_plan').filter(sampling_plan__monitoring_type=monitoring_type)

        plan = qs.first().sampling_plan if qs.exists() else EMSamplingPlan.objects.filter(area=area).first()

        return Response({
            'area': area,
            'dates': [r.sampling_date.isoformat() for r in qs],
            'values': [float(r.result_value) for r in qs],
            'action_limit': float(plan.action_limit) if plan else None,
            'alert_limit': float(plan.alert_limit) if plan else None,
        })
