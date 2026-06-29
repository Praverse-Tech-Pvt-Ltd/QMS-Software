from django.urls import path
from . import views

urlpatterns = [
    path('sop/upload/', views.SOPUploadView.as_view(), name='sop-upload'),
    path('sop/list/', views.SOPListView.as_view(), name='sop-list'),
    path('sop/query/', views.SOPQueryView.as_view(), name='sop-query'),
    path('fda-risk/', views.FDARiskView.as_view(), name='fda-risk'),
]
