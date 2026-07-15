"""
Record Retention Policy admin (Phase 8).
Any authenticated user can list/retrieve; only Admin can create/update —
matches the _is_admin per-method gating pattern used by accounts.views.SiteViewSet.
Admin edits are written to the centralised AuditLog with an old/new
retention_years diff, mirroring the shape used by shared/workflow.py:transition().
"""
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import RetentionPolicy, AuditLog
from .retention_serializers import RetentionPolicySerializer


class RetentionPolicyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RetentionPolicySerializer
    queryset = RetentionPolicy.objects.all().order_by('record_type')

    def _is_admin(self, request):
        return getattr(request.user, 'role', '') == 'Admin'

    def _write_audit_log(self, request, instance, old_years):
        new_years = instance.retention_years
        if old_years == new_years:
            return
        AuditLog.objects.create(
            user=request.user,
            user_email=request.user.email,
            action='UPDATE',
            content_type=ContentType.objects.get_for_model(RetentionPolicy),
            object_id=str(instance.pk),
            reason='Retention policy updated',
            changes={'retention_years': {'old': old_years, 'new': new_years}},
        )

    def create(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can create retention policies'}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can edit retention policies'}, status=403)
        instance = self.get_object()
        old_years = instance.retention_years
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200:
            instance.refresh_from_db()
            self._write_audit_log(request, instance, old_years)
        return response

    def partial_update(self, request, *args, **kwargs):
        if not self._is_admin(request):
            return Response({'error': 'Only Admin can edit retention policies'}, status=403)
        instance = self.get_object()
        old_years = instance.retention_years
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code == 200:
            instance.refresh_from_db()
            self._write_audit_log(request, instance, old_years)
        return response
