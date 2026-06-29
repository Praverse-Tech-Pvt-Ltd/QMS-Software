from celery import shared_task
from datetime import date


@shared_task(name='complaints.tasks.alert_overdue')
def alert_overdue():
    from .models import Complaint
    today = date.today()
    overdue = Complaint.objects.filter(
        is_active=True,
        response_deadline__lt=today,
    ).exclude(status='closed')
    count = overdue.count()
    # TODO: send email notification in Phase 3
    return f'Found {count} overdue complaints'
