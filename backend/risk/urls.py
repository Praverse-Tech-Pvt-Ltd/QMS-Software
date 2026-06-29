from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.RiskViewSet, basename='risk')

urlpatterns = [
    # Must precede router.urls — otherwise DRF's detail route (`<pk>/`) shadows this.
    path('matrix/', views.RiskMatrixView.as_view(), name='risk-matrix'),
    path('', include(router.urls)),
]
