from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name='dms.tasks.alert_document_review_due')
def alert_document_review_due():
    """
    Daily task: flag effective documents due for periodic review within 30 days
    and email the document owner plus QA.
    """
    from django.contrib.auth import get_user_model
    from .models import Document

    User = get_user_model()
    threshold = date.today() + timedelta(days=30)
    due = Document.objects.filter(
        next_review_date__lte=threshold,
        status=Document.Status.EFFECTIVE,
    )

    notified = 0
    for document in due:
        recipients = set()
        if document.owner and document.owner.email:
            recipients.add(document.owner.email)
        recipients.update(
            User.objects.filter(role__in=['QA Manager', 'QA Head'], is_active=True)
            .exclude(email='').values_list('email', flat=True)
        )

        if recipients:
            days_left = (document.next_review_date - date.today()).days
            send_mail(
                subject=f'[NexGen QMS] Periodic Review {"Overdue" if days_left <= 0 else "Due Soon"} — {document.document_id}',
                message=(
                    f'Document: {document.document_id} — {document.title}\n'
                    f'Department: {document.department}\n'
                    f'Review Due: {document.next_review_date}\n'
                    f'Days Remaining: {days_left}\n\n'
                    f'Please complete the periodic review to remain compliant.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=list(recipients),
                fail_silently=True,
            )
            notified += 1

    return f'Document review check: {due.count()} document(s) due/overdue, {notified} notified'
