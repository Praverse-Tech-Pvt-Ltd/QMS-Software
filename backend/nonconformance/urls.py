from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.NCViewSet, basename='nc')

urlpatterns = [
    # Must precede router.urls — otherwise DRF's detail route (`<pk>/`) shadows this.
    path('trends/', views.NCTrendsView.as_view(), name='nc-trends'),
    path('', include(router.urls)),
]
