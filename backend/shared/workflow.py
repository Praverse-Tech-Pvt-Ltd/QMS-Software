"""
Universal workflow state machine for all regulated QMS modules.

Usage in a model:
    TRANSITIONS = {
        'draft': ['submitted'],
        'submitted': ['approved', 'rejected'],
        'approved': ['closed'],
        'rejected': ['draft'],
    }
    ESIG_REQUIRED_ACTIONS = ['approved', 'closed']

Usage in a view:
    from shared.workflow import transition
    transition(record, 'approved', request.user, reason='LGTM', esig_password='secret')
"""
import hashlib
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from core.models import AuditLog


def verify_esignature(user, password: str) -> None:
    """
    Verify the user's password as an electronic signature.
    Raises ValidationError if the password is wrong.
    """
    if not password:
        raise ValidationError('E-signature required: password must be provided.')
    if not user.check_password(password):
        raise ValidationError('E-signature failed: incorrect password.')


def transition(record, action: str, user, reason: str = '', esig_password: str | None = None) -> None:
    """
    Perform a workflow transition on a regulated record.

    Args:
        record: Any model instance with TRANSITIONS and a `status` field.
        action: The target status value to transition to.
        user: The authenticated User performing the action.
        reason: Free-text reason (stored in audit log).
        esig_password: Required if action is in ESIG_REQUIRED_ACTIONS.

    Raises:
        ValidationError: If the transition is invalid or e-sig fails.
    """
    transitions: dict = getattr(record.__class__, 'TRANSITIONS', {})
    esig_required: list = getattr(record.__class__, 'ESIG_REQUIRED_ACTIONS', [])

    current_status = record.status

    # Guard: action must be a valid next step from current status
    allowed_next = transitions.get(current_status, [])
    if action not in allowed_next:
        raise ValidationError(
            f"Transition from '{current_status}' to '{action}' is not allowed. "
            f"Valid transitions: {allowed_next or 'none'}"
        )

    # Guard: e-signature if required
    if action in esig_required:
        verify_esignature(user, esig_password or '')

    old_status = current_status
    record.status = action
    record.modified_by = user
    record.save()

    # Write to centralised AuditLog
    content_type = ContentType.objects.get_for_model(record.__class__)
    AuditLog.objects.create(
        user=user,
        user_email=user.email,
        action='APPROVE' if action in ('approved', 'closed', 'effective') else 'UPDATE',
        reason=reason,
        content_type=content_type,
        object_id=str(record.pk),
        changes={
            'status': {
                'old': old_status,
                'new': action,
            }
        },
    )
