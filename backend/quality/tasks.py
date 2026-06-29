from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


@shared_task(name='quality.tasks.alert_overdue_actions')
def alert_overdue_actions():
    """
    Daily task: find all overdue CAPA actions.
    Email the assigned owner; escalate to QA Managers if 3+ days overdue.
    """
    from datetime import date
    from django.contrib.auth import get_user_model
    from .models import CapaAction

    User = get_user_model()
    today = date.today()
    overdue = CapaAction.objects.filter(
        due_date__lt=today,
        status__in=['PENDING', 'IN_PROGRESS'],
    ).select_related('assigned_to', 'capa')

    notified = 0
    escalated = 0

    for action in overdue:
        days_overdue = (today - action.due_date).days
        owner = action.assigned_to
        owner_email = owner.email if owner else None

        if owner_email:
            send_mail(
                subject=f'[NexGen QMS] CAPA Action Overdue — {action.capa.capa_number}',
                message=(
                    f'Your CAPA action is {days_overdue} day(s) overdue.\n\n'
                    f'CAPA: {action.capa.capa_number}\n'
                    f'Action: {action.action_description}\n'
                    f'Due Date: {action.due_date}\n\n'
                    f'Please update the status or submit an extension request.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[owner_email],
                fail_silently=True,
            )
            notified += 1

        if days_overdue >= 3:
            qa_managers = User.objects.filter(role__in=['qa_manager', 'QA Manager'], is_active=True)
            escalation_emails = list(qa_managers.values_list('email', flat=True))
            if escalation_emails:
                send_mail(
                    subject=f'[NexGen QMS] ESCALATION — CAPA Action {days_overdue} days overdue',
                    message=(
                        f'A CAPA action assigned to '
                        f'{owner.get_full_name() if owner else "Unknown"} '
                        f'is {days_overdue} days overdue.\n\n'
                        f'CAPA: {action.capa.capa_number}\n'
                        f'Action: {action.action_description}\n'
                        f'Due Date: {action.due_date}'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=escalation_emails,
                    fail_silently=True,
                )
                escalated += 1

    return f'Overdue CAPA actions: {overdue.count()} total, {notified} notified, {escalated} escalated'
