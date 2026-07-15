import re

from django.conf import settings
from django.core.exceptions import ValidationError


class MinimumLengthValidator:
    def validate(self, password, user=None):
        n = getattr(settings, 'PASSWORD_MIN_LENGTH', 8)
        if len(password) < n:
            raise ValidationError(
                f'Password must be at least {n} characters.',
                code='password_too_short',
            )

    def get_help_text(self):
        return f'At least {getattr(settings, "PASSWORD_MIN_LENGTH", 8)} characters.'


class ComplexityValidator:
    def validate(self, password, user=None):
        errors = []
        if not re.search(r'[A-Z]', password):
            errors.append('uppercase letter')
        if not re.search(r'[a-z]', password):
            errors.append('lowercase letter')
        if not re.search(r'\d', password):
            errors.append('digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('special character')
        if errors:
            raise ValidationError(
                f'Password must contain: {", ".join(errors)}.',
                code='password_too_simple',
            )

    def get_help_text(self):
        return 'Must contain uppercase, lowercase, digit, and special character.'


class HistoryValidator:
    def validate(self, password, user=None):
        if user is None or not user.pk:
            return
        from django.contrib.auth.hashers import check_password

        from accounts.models import PasswordHistory

        n = getattr(settings, 'PASSWORD_HISTORY_COUNT', 5)
        for rec in PasswordHistory.objects.filter(user=user).order_by('-set_at')[:n]:
            if check_password(password, rec.password_hash):
                raise ValidationError(
                    f'Cannot reuse any of your last {n} passwords.',
                    code='password_reused',
                )

    def get_help_text(self):
        return f'Cannot reuse last {getattr(settings, "PASSWORD_HISTORY_COUNT", 5)} passwords.'
