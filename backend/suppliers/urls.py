from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.SupplierViewSet, basename='supplier')

urlpatterns = [
    # Must precede router.urls — otherwise DRF's detail route (`<pk>/`) shadows these.
    path('asl/', views.ASLView.as_view(), name='supplier-asl'),
    path('expiring/', views.ExpiringSupplierView.as_view(), name='suppliers-expiring'),
    path('', include(router.urls)),
]
