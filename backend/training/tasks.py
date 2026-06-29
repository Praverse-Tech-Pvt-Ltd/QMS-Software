from celery import shared_task


@shared_task(name='training.tasks.alert_overdue')
def alert_overdue():
    from datetime import date
    from .models import TrainingAssignment
    today = date.today()
    overdue = TrainingAssignment.objects.filter(due_date__lt=today, status='PENDING')
    count = overdue.count()
    # TODO: send email notification in Phase 3
    return f'Found {count} overdue training assignments'
