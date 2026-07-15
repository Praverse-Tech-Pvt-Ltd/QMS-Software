from django.conf import settings as conf
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

# Password value as it existed in the DB immediately before the current save,
# keyed by pk. Populated in pre_save, consumed (and popped) in post_save — lets
# us tell a genuine password change apart from an unrelated field update (e.g.
# role/department edits), which the naive "diff against last history row"
# approach can't: on a user's very first non-password save (no history rows
# yet), that approach would wrongly record a spurious history entry.
_pre_save_passwords = {}


@receiver(pre_save, sender=conf.AUTH_USER_MODEL)
def _cache_password_before_save(sender, instance, **kwargs):
    if not instance.pk:
        _pre_save_passwords[instance.pk] = None
        return
    try:
        _pre_save_passwords[instance.pk] = sender.objects.only('password').get(pk=instance.pk).password
    except sender.DoesNotExist:
        _pre_save_passwords[instance.pk] = None


@receiver(post_save, sender=conf.AUTH_USER_MODEL)
def save_password_history(sender, instance, created, **kwargs):
    if not instance.password:
        return
    old_password = _pre_save_passwords.pop(instance.pk, None)
    if not created and old_password == instance.password:
        return  # this save didn't change the password — nothing to record

    from accounts.models import PasswordHistory

    PasswordHistory.objects.create(user=instance, password_hash=instance.password)
    n = getattr(conf, 'PASSWORD_HISTORY_COUNT', 5)
    stale = list(
        PasswordHistory.objects.filter(user=instance)
        .order_by('-set_at')
        .values_list('pk', flat=True)[n:]
    )
    if stale:
        PasswordHistory.objects.filter(pk__in=stale).delete()
