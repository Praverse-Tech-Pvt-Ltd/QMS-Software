from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.ComplaintViewSet, basename='complaint')

urlpatterns = [
    # Must precede router.urls — otherwise DRF's detail route (`<pk>/`) shadows these.
    path('overdue/', views.OverdueComplaintsView.as_view(), name='complaints-overdue'),
    path('trends/', views.ComplaintTrendsView.as_view(), name='complaints-trends'),
    path('', include(router.urls)),
]
