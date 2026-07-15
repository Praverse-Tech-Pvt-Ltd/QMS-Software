from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .retention_views import RetentionPolicyViewSet

router = DefaultRouter()
router.register('', RetentionPolicyViewSet, basename='retention-policy')

urlpatterns = [
    path('', include(router.urls)),
]
