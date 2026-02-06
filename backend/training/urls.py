from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingPlanViewSet, TrainingAssignmentViewSet

router = DefaultRouter()
router.register(r'plans', TrainingPlanViewSet)
router.register(r'assignments', TrainingAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]