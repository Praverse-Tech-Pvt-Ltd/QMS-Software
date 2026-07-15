"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import dashboard_stats, my_tasks

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/', include('accounts.urls')),

    # Multi-site UI (Phase 6 Block 7)
    path('api/v1/accounts/', include('accounts.site_urls')),

    # Existing modules
    path('api/dms/', include('dms.urls')),
    path('api/quality/', include('quality.urls')),
    path('api/training/', include('training.urls')),

    # Dashboard
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('api/dashboard/tasks/', my_tasks, name='my-tasks'),

    # Audit trail export
    path('api/v1/audit-trail/', include('core.audit_urls')),

    # AI services
    path('api/v1/ai/', include('shared.urls')),

    # Phase 1 modules
    path('api/v1/audits/', include('audits.urls')),
    path('api/v1/complaints/', include('complaints.urls')),
    path('api/v1/risks/', include('risk.urls')),
    path('api/v1/suppliers/', include('suppliers.urls')),
    path('api/v1/nc/', include('nonconformance.urls')),
    path('api/v1/oos/', include('quality.oos_urls')),
    path('api/v1/knowledge/', include('knowledge.urls')),

    # Phase 2 modules
    path('api/v1/laboratory/', include('laboratory.urls')),
    path('api/v1/batch-records/', include('batch_records.urls')),
    path('api/v1/reports/', include('reports.urls')),

    # Phase 6 modules
    path('api/v1/logbooks/', include('logbooks.urls')),
    path('api/v1/stability/', include('stability.urls')),
    path('api/v1/environmental/', include('environmental.urls')),
    path('api/v1/recall/', include('recall.urls')),

    # Phase 7 modules
    path('api/v1/analyst-qualification/', include('analyst_qualification.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/integrations/', include('integrations.urls')),

    # Phase 8 modules
    path('api/v1/core/retention-policies/', include('core.retention_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)