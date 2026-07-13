from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingPlanViewSet, TrainingAssignmentViewSet, my_training_history, training_calendar

router = DefaultRouter()
router.register(r'plans', TrainingPlanViewSet, basename='training-plan')
router.register(r'assignments', TrainingAssignmentViewSet, basename='training-assignment')

urlpatterns = [
    path('calendar/', training_calendar, name='training-calendar'),
    path('', include(router.urls)),
    path('history/', my_training_history, name='training-history'),
]