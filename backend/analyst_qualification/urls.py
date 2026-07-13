from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('techniques', views.AnalyticalTechniqueViewSet, basename='analytical-technique')
router.register('records', views.AnalystQualificationRecordViewSet, basename='analyst-qualification-record')

urlpatterns = [
    path('', include(router.urls)),
]
