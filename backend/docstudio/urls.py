from django.urls import path
from . import views

urlpatterns = [
    path('stage-library/', views.stage_library, name='docstudio-stage-library'),
    path('mbr/skeleton/', views.mbr_skeleton, name='docstudio-mbr-skeleton'),
    path('mbr/create/', views.mbr_create, name='docstudio-mbr-create'),
    path('regulatory-triggers/', views.regulatory_triggers_view, name='docstudio-reg-triggers'),
]
