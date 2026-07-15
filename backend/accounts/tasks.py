from celery import shared_task


@shared_task(name='accounts.tasks.check_password_expiry')
def check_password_expiry():
    from datetime import timedelta

    from django.conf import settings
    from django.contrib.auth import get_user_model
    from django.utils import timezone

    days = getattr(settings, 'PASSWORD_EXPIRY_DAYS', 90)
    threshold = timezone.now() - timedelta(days=days)
    count = get_user_model().objects.filter(
        password_changed_at__lt=threshold,
        is_active=True, must_change_password=False,
    ).update(must_change_password=True)
    return {'flagged': count}
