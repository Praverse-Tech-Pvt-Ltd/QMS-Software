from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog
from dms.models import Document 
from .middleware import get_current_user
from quality.models import Deviation
# List of models to track automatically

TRACKED_MODELS = [Document, Deviation]

@receiver(pre_save)
def capture_old_state(sender, instance, **kwargs):
    """
    Before saving, capture the OLD state of the record so we can compare it later.
    """
    if sender in TRACKED_MODELS and instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_state = model_to_dict(old_instance)
        except sender.DoesNotExist:
            instance._old_state = {}

@receiver(post_save)
def log_save_changes(sender, instance, created, **kwargs):
    """
    After saving, compare OLD vs NEW and log the differences.
    """
    if sender not in TRACKED_MODELS:
        return

    import inspect
    
    # Getting the user is tricky in signals because we don't have the 'request'.
    # For now, we will handle the user context via a middleware approach later.
    # We will leave user None for this automated step or pass it manually.
    
    action = 'CREATE' if created else 'UPDATE'
    changes = {}

    if not created and hasattr(instance, '_old_state'):
        new_state = model_to_dict(instance)
        for key, value in new_state.items():
            old_value = instance._old_state.get(key)
            if old_value != value:
                changes[key] = {'old': str(old_value), 'new': str(value)}

    # Only log if there are actual changes or it's a new record
    if created or changes:
        AuditLog.objects.create(
            user=get_current_user(), # We will fix this with Middleware next
            action=action,
            content_type=ContentType.objects.get_for_model(instance),
            object_id=str(instance.pk),
            changes=changes
        )