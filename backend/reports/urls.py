from django.urls import path
from . import views

urlpatterns = [
    path('management-review/', views.ManagementReviewView.as_view(), name='management-review'),
    path('apqr/generate/', views.APQRGenerateView.as_view(), name='apqr-generate'),
    path('apqr/<uuid:pk>/', views.APQRDetailView.as_view(), name='apqr-detail'),
    path('apqr/<uuid:pk>/export/', views.APQRExportView.as_view(), name='apqr-export'),
]
