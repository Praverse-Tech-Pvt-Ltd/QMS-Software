from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q  # ✅ Required for complex counts
from datetime import date

# Import your models
from quality.models import Deviation, Capa, ChangeControl
from training.models import TrainingAssignment
from dms.models import Document

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns nested counts for dashboard cards, including Overdue vs. Open logic.
    """
    today = date.today()
    dept_hotspots = Deviation.objects.exclude(status='CLOSED')\
    .values('department')\
    .annotate(count=Count('id'))\
    .order_by('-count')[:5]
    # 1. Deviation Aggregation
    deviations = Deviation.objects.aggregate(
        open=Count('id', filter=~Q(status='CLOSED')),
        overdue=Count('id', filter=Q(occurrence_date__lt=today) & ~Q(status='CLOSED'))
    )
    
    # 2. CAPA Aggregation
    capas = Capa.objects.aggregate(
        open=Count('id', filter=~Q(status__in=['COMPLETED', 'VERIFIED'])),
        overdue=Count('id', filter=Q(due_date__lt=today) & ~Q(status__in=['COMPLETED', 'VERIFIED']))
    )
    
    # 3. Change Control Aggregation
    changes = ChangeControl.objects.aggregate(
        open=Count('id', filter=~Q(status='CLOSED')),
        overdue=Count('id', filter=Q(target_date__lt=today) & ~Q(status='CLOSED'))
    )

    # 4. User Specific Stats
    my_training_pending = TrainingAssignment.objects.filter(
        user=request.user, 
        status__in=['PENDING', 'OVERDUE']
    ).count()
    
    my_capas = Capa.objects.filter(
        assigned_to=request.user,
        status__in=['PLANNING', 'PENDING']
    ).count()

    return Response({
        "quality": {
            "deviations": deviations,
            "capas": capas,
            "change_controls": changes,
            "department_hotspots": list(dept_hotspots)
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
    Returns a unified, sorted list of tasks for the logged-in user.
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
            "priority": "High"
        })

    # 3. Get Assigned Change Controls
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