from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import TrainingPlan, TrainingAssignment
from .serializers import TrainingPlanSerializer, TrainingAssignmentSerializer

class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Action: Assign this plan to a user
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        plan = self.get_object()
        user_id = request.data.get('user_id')
        due_date = request.data.get('due_date')

        assignment = TrainingAssignment.objects.create(
            plan=plan,
            user_id=user_id,
            due_date=due_date
        )
        return Response(TrainingAssignmentSerializer(assignment).data)

class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own training, Admins see all
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