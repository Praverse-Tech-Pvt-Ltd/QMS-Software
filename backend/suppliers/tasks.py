from celery import shared_task
from datetime import date, timedelta


@shared_task(name='suppliers.tasks.alert_expiring')
def alert_expiring():
    from .models import Supplier
    cutoff = date.today() + timedelta(days=30)
    expiring = Supplier.objects.filter(
        is_active=True,
        status='qualified',
        expiry_date__lte=cutoff,
    )
    count = expiring.count()
    # TODO: send email notification in Phase 3
    return f'Found {count} suppliers expiring within 30 days'
