from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('mbr', views.MasterBatchRecordViewSet, basename='mbr')
router.register('bpr', views.BatchProductionRecordViewSet, basename='bpr')

urlpatterns = [
    path('', include(router.urls)),
]
