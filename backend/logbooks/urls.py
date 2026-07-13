from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('entries', views.LogbookEntryViewSet, basename='logbook-entry')
router.register('', views.LogbookViewSet, basename='logbook')

urlpatterns = [
    path('', include(router.urls)),
]
