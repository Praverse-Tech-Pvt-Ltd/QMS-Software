from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('samples', views.SampleViewSet, basename='sample')
router.register('test-requests', views.TestRequestViewSet, basename='test-request')
router.register('instruments', views.InstrumentViewSet, basename='instrument')

urlpatterns = [
    path('', include(router.urls)),
]
