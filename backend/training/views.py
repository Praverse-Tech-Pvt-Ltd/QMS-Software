from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import TrainingPlan, TrainingAssignment
from .serializers import TrainingPlanSerializer, TrainingAssignmentSerializer
from django.contrib.auth import get_user_model

class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ✅ CUSTOM LOOKUP: Allows URL to use "TRN-5" or "5"
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # If ID starts with "TRN-", strip it to get the number
        if isinstance(lookup_value, str) and lookup_value.startswith('TRN-'):
            try:
                clean_id = int(lookup_value.replace('TRN-', ''))
                obj = get_object_or_404(queryset, pk=clean_id)
            except ValueError:
                # If conversion fails, try looking up as is (if you add a string field later)
                obj = get_object_or_404(queryset, **{self.lookup_field: lookup_value})
        else:
            # Standard numeric lookup
            obj = get_object_or_404(queryset, **{self.lookup_field: lookup_value})

        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        plan = self.get_object()
        
        # 1. Validate Input
        user_id = request.data.get('user_id')
        due_date = request.data.get('due_date')

        if not user_id or not due_date:
            return Response(
                {"error": "User ID and Due Date are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Check if User Exists
        try:
            User = get_user_model()
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # 3. Check for DUPLICATES
        if TrainingAssignment.objects.filter(plan=plan, user=user, status__in=['PENDING', 'OVERDUE']).exists():
            return Response(
                {"error": f"Training '{plan.title}' is already assigned to {user.first_name}."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Create the Assignment
        assignment = TrainingAssignment.objects.create(
            plan=plan,
            user=user,
            due_date=due_date,
            status='PENDING'
        )
        
        return Response({
            "message": f"Successfully assigned to {user.first_name} {user.last_name}",
            "assignment_id": assignment.id
        }, status=status.HTTP_201_CREATED)

class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Admin', 'QA']:
            return TrainingAssignment.objects.all()
        return TrainingAssignment.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = 'COMPLETED'
        assignment.completion_date = timezone.now().date()
        assignment.score = request.data.get('score', 100)
        assignment.save()
        return Response({'status': 'Training Completed'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_training_history(request):
    """
    Returns training assignments for the logged-in user.
    """
    user = request.user
    
    if user.role in ['Admin', 'QA', 'Manager']:
        assignments = TrainingAssignment.objects.all().select_related('plan', 'user').order_by('-due_date')
    else:
        assignments = TrainingAssignment.objects.filter(user=user).select_related('plan').order_by('-due_date')
    
    data = []
    for t in assignments:
        data.append({
            # ✅ Display ID (e.g., TRN-5)
            "id": f"TRN-{t.plan.id}", 
            
            # ✅ Numeric ID for Navigation (Critical for Frontend)
            "record_id": t.plan.id,   
            
            # ✅ Assignment ID (Useful for specific completion logic)
            "assignment_id": t.id,    

            "title": t.plan.title,
            "department": t.plan.department,
            "status": t.status, 
            "due_date": t.due_date,
            "completion_date": t.completion_date,
            "score": t.score,
            "assigned_to": f"{t.user.first_name} {t.user.last_name}" 
        })
    
    return Response(data)