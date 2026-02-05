from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .stats_views import DashboardStatsView
from .views import ChangeControlViewSet, DeviationViewSet, CapaViewSet

router = DefaultRouter()
router.register(r'deviations', DeviationViewSet)
router.register(r'capa', CapaViewSet)
router.register(r'change-control', ChangeControlViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]