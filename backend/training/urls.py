from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrainingPlanViewSet, TrainingAssignmentViewSet, my_training_history, training_calendar,
    SCORMModuleViewSet, SCORMResultViewSet,
)

router = DefaultRouter()
router.register(r'plans', TrainingPlanViewSet, basename='training-plan')
router.register(r'assignments', TrainingAssignmentViewSet, basename='training-assignment')
router.register(r'scorm-modules', SCORMModuleViewSet, basename='scorm-module')
router.register(r'scorm-results', SCORMResultViewSet, basename='scorm-result')

urlpatterns = [
    path('calendar/', training_calendar, name='training-calendar'),
    path('', include(router.urls)),
    path('history/', my_training_history, name='training-history'),
]