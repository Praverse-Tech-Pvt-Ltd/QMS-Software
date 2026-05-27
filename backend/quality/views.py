from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

from .models import Deviation, Capa, ChangeControl
from .serializers import DeviationSerializer, CapaSerializer, ChangeControlSerializer
from core.models import AuditLog

class BaseQualityViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet to provide standardized history fetching for all Quality modules.
    """
    def get_history_data(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        logs = AuditLog.objects.filter(content_type=content_type, object_id=obj.id).order_by('-timestamp')
        
        return [{
            "id": log.id,
            "timestamp": log.timestamp,
            "user": log.user.get_full_name() if log.user else "System",
            "role": getattr(log.user, 'role', 'User') if log.user else "System",
            "actionType": log.action,
            "changes": log.changes,
            "reason": log.reason
        } for log in logs]

class DeviationViewSet(BaseQualityViewSet):
    queryset = Deviation.objects.all().order_by('-created_at')
    serializer_class = DeviationSerializer
    lookup_field = 'deviation_id'

    def perform_create(self, serializer):
        instance = serializer.save(raised_by=self.request.user)
        AuditLog.objects.create(
            user=self.request.user,
            content_object=instance,
            action='CREATE',
            reason="Initial report created."
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        # Snapshot current state
        old_data = {
            "title": instance.title,
            "description": instance.description,
            "status": instance.status,
            "immediate_actions": getattr(instance, 'immediate_actions', ''),
            "risk_level": instance.risk_level,
        }
        updated_instance = serializer.save()
        
        # Detect Changes
        changes = {}
        for field, old_val in old_data.items():
            new_val = getattr(updated_instance, field)
            if str(old_val) != str(new_val):
                changes[field] = {"old": old_val, "new": new_val}

        if changes:
            AuditLog.objects.create(
                user=self.request.user,
                content_object=updated_instance,
                action='UPDATE',
                changes=changes,
                reason=self.request.data.get('change_reason', 'Field update')
            )

    @action(detail=True, methods=['get'])
    def history(self, request, deviation_id=None):
        return Response(self.get_history_data(self.get_object()))

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_deviation(self, request, deviation_id=None):
        deviation = self.get_object()
        if deviation.status != 'DRAFT':
            return Response({"error": "Only drafts can be submitted."}, status=400)

        deviation.status = 'INVESTIGATION'
        deviation.save()
        
        AuditLog.objects.create(
            user=request.user,
            content_object=deviation,
            action='STATUS_CHANGE',
            changes={"status": {"old": "DRAFT", "new": "INVESTIGATION"}},
            reason=request.data.get('change_reason', 'Submitted for investigation')
        )
        return Response({"status": "success", "current_status": deviation.status})

class CapaViewSet(BaseQualityViewSet):
    queryset = Capa.objects.all().order_by('-created_at')
    serializer_class = CapaSerializer
    lookup_field = 'capa_id'

    def perform_update(self, serializer):
        instance = self.get_object()
        old_values = {
            "status": instance.status,
            "root_cause": instance.root_cause,
            "action_plan": instance.action_plan,
            "due_date": str(instance.due_date) if instance.due_date else None,
        }
        updated_instance = serializer.save()
        
        changes = {}
        for field, old_val in old_values.items():
            new_val = getattr(updated_instance, field)
            if str(old_val) != str(new_val):
                changes[field] = {"old": old_val, "new": new_val}

        if changes:
            AuditLog.objects.create(
                user=self.request.user,
                content_object=updated_instance,
                action='UPDATE',
                changes=changes,
                reason=self.request.data.get('change_reason', 'Investigation update')
            )

    @action(detail=True, methods=['get'])
    def history(self, request, capa_id=None):
        return Response(self.get_history_data(self.get_object()))
    
    @action(detail=True, methods=['post'], url_path='add-action')
    def add_action(self, request, capa_id=None):
        capa = self.get_object()
        serializer = CapaActionSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(capa=capa)
            
            # Log this in the Audit Trail
            AuditLog.objects.create(
                user=request.user,
                content_object=capa,
                action='UPDATE',
                reason=f"Added new action: {serializer.validated_data['description']}"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_capa(self, request, capa_id=None):
        capa = self.get_object()
        if request.user.role not in ['QA', 'Admin']:
            return Response({"error": "Only QA can verify CAPAs."}, status=403)

        old_status = capa.status
        capa.status = 'VERIFIED'
        capa.save()
        
        AuditLog.objects.create(
            user=request.user,
            content_object=capa,
            action='APPROVE',
            changes={"status": {"old": old_status, "new": "VERIFIED"}},
            reason=request.data.get('change_reason', 'Effectiveness verified')
        )

        # Automation: Close Deviation if all CAPAs are closed
        deviation = capa.deviation
        if deviation and not deviation.capas.exclude(status='VERIFIED').exists():
            deviation.status = 'CLOSED'
            deviation.save()
            AuditLog.objects.create(
                user=None, # System action
                content_object=deviation,
                action='STATUS_CHANGE',
                reason=f"Automatically closed because CAPA {capa.capa_id} was verified."
            )
        return Response({"message": "CAPA Verified and logged."})

class ChangeControlViewSet(BaseQualityViewSet):
    queryset = ChangeControl.objects.all().order_by('-created_at')
    serializer_class = ChangeControlSerializer
    lookup_field = 'cc_id'

    def perform_create(self, serializer):
        # initiator is a ForeignKey to User
        instance = serializer.save(initiator=self.request.user)
        
        # Log the initiation in the Audit Trail
        AuditLog.objects.create(
            user=self.request.user,
            content_object=instance,
            action='CREATE',
            reason=self.request.data.get('change_reason', "Change Control initiated via Web Form.")
        )
        
    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Snapshot of fields to track in Audit Trail
        fields_to_track = [
            "status", "title", "description", "justification", 
            "change_type", "department", "target_date", "impact_data"
        ]
        
        old_data = {f: getattr(instance, f) for f in fields_to_track}
        updated_instance = serializer.save()
        
        # Generate Delta for Audit Log
        changes = {
            f: {"old": v, "new": getattr(updated_instance, f)} 
            for f, v in old_data.items() 
            if str(v) != str(getattr(updated_instance, f))
        }

        if changes:
            AuditLog.objects.create(
                user=self.request.user,
                content_object=updated_instance,
                action='UPDATE',
                changes=changes,
                reason=self.request.data.get('change_reason', 'Data update')
            )

    @action(detail=True, methods=['get'])
    def history(self, request, cc_id=None):
        return Response(self.get_history_data(self.get_object()))

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_cc(self, request, cc_id=None):
        cc = self.get_object()
        # GxP Rule: Only QA or Admin can approve Changes
        if request.user.role not in ['QA', 'Admin']:
            return Response({"error": "QA approval required for this transition."}, status=403)

        old_status = cc.status
        cc.status = 'IMPLEMENTATION'
        cc.save()
        
        AuditLog.objects.create(
            user=request.user,
            content_object=cc,
            action='APPROVE',
            changes={"status": {"old": old_status, "new": 'IMPLEMENTATION'}},
            reason=request.data.get('change_reason', 'Approved for implementation')
        )
        return Response({"message": f"Change Control {cc.cc_id} approved."})