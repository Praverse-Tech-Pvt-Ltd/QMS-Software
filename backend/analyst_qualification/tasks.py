from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name='analyst_qualification.tasks.alert_qualifications_expiring')
def alert_qualifications_expiring():
    """
    Daily task: email analysts (plus QA) whose qualification on a technique is
    'qualified' and expiring within 30 days. Mirrors laboratory.tasks.alert_calibration_due
    and dms.tasks.alert_document_review_due — email failures never block the task
    (fail_silently=True), per the AI/integrations-never-block rule.
    """
    from django.contrib.auth import get_user_model
    from analyst_qualification.models import AnalystQualificationRecord

    User = get_user_model()
    threshold = date.today() + timedelta(days=30)
    expiring = AnalystQualificationRecord.objects.filter(
        expiry_date__lte=threshold,
        status='qualified',
        is_active=True,
    ).select_related('analyst', 'technique')

    notified = 0
    for record in expiring:
        recipients = set()
        if record.analyst and record.analyst.email:
            recipients.add(record.analyst.email)
        recipients.update(
            User.objects.filter(role__in=['QA Manager', 'QA Head'], is_active=True)
            .exclude(email='').values_list('email', flat=True)
        )

        if recipients:
            days_left = (record.expiry_date - date.today()).days
            send_mail(
                subject=(
                    f'[NexGen QMS] Analyst Qualification '
                    f'{"Expired" if days_left <= 0 else "Expiring Soon"} — {record.qualification_id}'
                ),
                message=(
                    f'Analyst: {record.analyst}\n'
                    f'Technique: {record.technique.name}\n'
                    f'Expiry Date: {record.expiry_date}\n'
                    f'Days Remaining: {days_left}\n\n'
                    f'Please schedule re-qualification to remain compliant.'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@nexgenqms.com'),
                recipient_list=list(recipients),
                fail_silently=True,
            )
            notified += 1

    return f'Qualification expiry check: {expiring.count()} record(s) expiring/expired, {notified} notified'
