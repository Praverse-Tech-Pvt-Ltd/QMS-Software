from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('configs', views.IntegrationConfigViewSet, basename='integration-config')
router.register('sync-log', views.IntegrationSyncLogViewSet, basename='integration-sync-log')

urlpatterns = [
    path('', include(router.urls)),
]
