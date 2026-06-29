import logging
from datetime import date

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task
def alert_overdue_action_items():
    """
    Daily: email assigned users about overdue open action items.
    Escalate to QA Manager / QA Head if 3+ days overdue.
    """
    from shared.models import ActionItem

    User = get_user_model()
    today = date.today()

    overdue = ActionItem.objects.filter(
        due_date__lt=today,
        status='open',
        is_active=True,
    ).select_related('assigned_to')

    for item in overdue:
        days_over = (today - item.due_date).days
        owner = item.assigned_to
        if owner and owner.email:
            send_mail(
                subject=f'[NexGen QMS] Action Item Overdue ({item.category})',
                message=(
                    f'Your action item is {days_over} day(s) overdue.\n\n'
                    f'Action: {item.action}\n'
                    f'Category: {item.category}\n'
                    f'Due: {item.due_date}\n'
                    f'Record: {item.record_type} {item.record_id}\n\n'
                    'Please close or request an extension with justification.'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexgenqms.com'),
                recipient_list=[owner.email],
                fail_silently=True,
            )
        # Escalate at 3+ days
        if days_over >= 3:
            qa_managers = User.objects.filter(
                role__in=['QA Manager', 'QA Head'], is_active=True,
            )
            emails = list(qa_managers.values_list('email', flat=True))
            if emails:
                send_mail(
                    subject=f'[NexGen QMS] ESCALATION: Action Item {days_over}d overdue',
                    message=(
                        f"Action item assigned to {owner.get_full_name() if owner else 'Unknown'}"
                        f" is {days_over} days overdue.\n\n"
                        f"Action: {item.action}\n"
                        f"Record: {item.record_type} {item.record_id}"
                    ),
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexgenqms.com'),
                    recipient_list=emails,
                    fail_silently=True,
                )

    return {'checked': overdue.count()}
