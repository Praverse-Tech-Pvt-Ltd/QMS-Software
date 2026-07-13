from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('pull-points', views.StabilityPullPointViewSet, basename='stability-pull-point')
router.register('protocols', views.StabilityProtocolViewSet, basename='stability-protocol')

urlpatterns = [
    path('', include(router.urls)),
]
