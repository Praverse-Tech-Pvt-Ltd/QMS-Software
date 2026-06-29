from django.urls import path
from .audit_views import AuditTrailExportView

urlpatterns = [
    path('', AuditTrailExportView.as_view(), name='audit-trail-export'),
]
