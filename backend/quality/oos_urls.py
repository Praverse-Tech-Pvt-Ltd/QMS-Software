from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .oos_views import OOSInvestigationViewSet, OOSStatsView

router = DefaultRouter()
router.register('', OOSInvestigationViewSet, basename='oos')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', OOSStatsView.as_view(), name='oos-stats'),
]
