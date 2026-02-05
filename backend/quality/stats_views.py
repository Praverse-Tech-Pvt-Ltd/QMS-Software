from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Deviation, Capa, ChangeControl

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. General Counters
        total_deviations = Deviation.objects.count()
        open_deviations = Deviation.objects.exclude(status='CLOSED').count()
        
        # 2. "My" items (Things assigned to the logged-in user)
        # Note: We need to check if 'raised_by' or 'assigned_to' exists in your models
        my_deviations = Deviation.objects.filter(raised_by=user).count()
        
        # 3. Pending Actions (Things needing attention)
        # Example: CAPAs assigned to me that are not done
        my_pending_capas = Capa.objects.filter(
            assigned_to=user, 
            status__in=['PLANNING', 'PENDING']
        ).count()

        # 4. Critical Items (High Risk)
        critical_issues = Deviation.objects.filter(
            risk_level='CRITICAL', 
            status__in=['DRAFT', 'INVESTIGATION', 'QA_REVIEW']
        ).count()

        return Response({
            "overview": {
                "total_deviations": total_deviations,
                "open_deviations": open_deviations,
                "critical_open": critical_issues
            },
            "user_specific": {
                "my_deviations": my_deviations,
                "my_pending_capas": my_pending_capas,
            }
        })