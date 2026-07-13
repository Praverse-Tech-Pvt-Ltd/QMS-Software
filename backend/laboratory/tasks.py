from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name='laboratory.tasks.alert_calibration_due')
def alert_calibration_due():
    """
    Daily task: flag instruments due for calibration within 30 days (or already
    overdue), update their status, and email the owning department plus QA.
    """
    from django.contrib.auth import get_user_model
    from .models import Instrument

    User = get_user_model()
    threshold = date.today() + timedelta(days=30)
    due = Instrument.objects.filter(
        next_calibration_date__lte=threshold,
        is_active=True,
    ).exclude(status='out_of_service')

    notified = 0
    for instrument in due:
        days_left = (instrument.next_calibration_date - date.today()).days
        new_status = 'overdue' if days_left <= 0 else 'due'
        if instrument.status != new_status:
            instrument.status = new_status
            instrument.save(update_fields=['status', 'updated_at'])

        recipients = list(
            User.objects.filter(department=instrument.department, is_active=True)
            .exclude(email='').values_list('email', flat=True)
        ) if instrument.department else []
        recipients += list(
            User.objects.filter(role__in=['QA Manager', 'QA Head'], is_active=True)
            .exclude(email='').values_list('email', flat=True)
        )

        if recipients:
            send_mail(
                subject=f'[NexGen QMS] Calibration {"Overdue" if days_left <= 0 else "Due Soon"} — {instrument.instrument_id}',
                message=(
                    f'Instrument: {instrument.instrument_id} — {instrument.name}\n'
                    f'Department: {instrument.department or "N/A"}\n'
                    f'Next Calibration Due: {instrument.next_calibration_date}\n'
                    f'Days Remaining: {days_left}\n\n'
                    f'Please schedule calibration to remain compliant.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipients,
                fail_silently=True,
            )
            notified += 1

    return f'Calibration check: {due.count()} instrument(s) due/overdue, {notified} notified'
