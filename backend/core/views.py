from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from datetime import date

# Import your models
from quality.models import Deviation, Capa, ChangeControl
from training.models import TrainingAssignment
from dms.models import Document

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns counts for the main dashboard cards.
    """
    user = request.user
    
    # 1. Quality Stats
    open_deviations = Deviation.objects.exclude(status='CLOSED').count()
    open_capas = Capa.objects.exclude(status__in=['COMPLETED', 'VERIFIED']).count()
    open_ccs = ChangeControl.objects.exclude(status='CLOSED').count()
    
    # 2. My Tasks Stats (Specific to logged-in user)
    my_training_pending = TrainingAssignment.objects.filter(
        user=user, 
        status__in=['PENDING', 'OVERDUE']
    ).count()
    
    my_capas = Capa.objects.filter(
        assigned_to=user,
        status__in=['PLANNING', 'PENDING']
    ).count()

    return Response({
        "quality": {
            "deviations": open_deviations,
            "capas": open_capas,
            "change_controls": open_ccs,
        },
        "user": {
            "pending_training": my_training_pending,
            "assigned_capas": my_capas,
            "total_tasks": my_training_pending + my_capas
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    """
    Returns a unified list of tasks for the 'My Tasks' page.
    """
    user = request.user
    tasks = []

    # 1. Get Pending Training
    trainings = TrainingAssignment.objects.filter(
        user=user, 
        status__in=['PENDING', 'OVERDUE']
    ).select_related('plan')
    
    for t in trainings:
        tasks.append({
            "id": f"TRN-{t.id}",
            "type": "Training",
            "title": t.plan.title,
            "status": t.status,
            "due_date": t.due_date,
            "priority": "High" if t.status == 'OVERDUE' else "Medium"
        })

    # 2. Get Assigned CAPAs
    capas = Capa.objects.filter(
        assigned_to=user,
        status__in=['PLANNING', 'PENDING']
    )
    
    for c in capas:
        tasks.append({
            "id": c.capa_id,
            "type": "CAPA",
            "title": c.title,
            "status": c.status,
            "due_date": c.due_date,
            "priority": "High" # CAPAs are usually high priority
        })

    # 3. Get Assigned Change Controls (as Initiator)
    ccs = ChangeControl.objects.filter(
        initiator=user,
        status__in=['DRAFT', 'EVALUATION', 'IMPLEMENTATION']
    )
    
    for cc in ccs:
        tasks.append({
            "id": cc.cc_id,
            "type": "Change Control",
            "title": cc.title,
            "status": cc.status,
            "due_date": cc.target_date,
            "priority": "Medium"
        })

    # Sort by due date (soonest first)
    tasks.sort(key=lambda x: x['due_date'] if x['due_date'] else date.max)

    return Response(tasks)