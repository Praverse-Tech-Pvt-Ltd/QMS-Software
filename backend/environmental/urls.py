from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('sampling-plans', views.EMSamplingPlanViewSet, basename='em-sampling-plan')
router.register('results', views.EMResultViewSet, basename='em-result')

urlpatterns = [
    path('', include(router.urls)),
]
