from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Deviation
from .serializers import DeviationSerializer
from .models import Deviation, Capa , ChangeControl
from .serializers import DeviationSerializer, CapaSerializer, ChangeControlSerializer

class DeviationViewSet(viewsets.ModelViewSet):
    queryset = Deviation.objects.all().order_by('-created_at')
    serializer_class = DeviationSerializer
    lookup_field = 'deviation_id'
    
    # permission_classes = [permissions.IsAuthenticated] # Ensure this is set

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)

    # --- ACTION 1: Submit (Draft -> Under Review) ---
    @action(detail=True, methods=['post', 'get'], url_path='submit')
    def submit_deviation(self, request, pk=None):
        deviation = self.get_object()
        
        # Validation: Can only submit Drafts
        if deviation.status != 'DRAFT':
            return Response(
                {"error": "Only drafts can be submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Logic: Update Status
        deviation.status = 'UNDER_REVIEW' # OR 'OPEN' depending on your choices
        deviation.save()
        
        return Response({
            "status": "success", 
            "message": f"Deviation {deviation.deviation_id} submitted for review.",
            "current_status": deviation.status
        })

    # --- ACTION 2: Approve (Under Review -> Approved) ---
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_deviation(self, request, pk=None):
        deviation = self.get_object()

        # Permission Check: Only QA/Admin can approve
        # (Assuming you have role logic on the user model)
        if request.user.role not in ['QA', 'Admin']:
             return Response(
                {"error": "Permission Denied. Only QA can approve."},
                status=status.HTTP_403_FORBIDDEN
            )

        if deviation.status != 'UNDER_REVIEW':
             return Response(
                {"error": "Deviation must be Under Review to approve."},
                status=status.HTTP_400_BAD_REQUEST
            )

        deviation.status = 'APPROVED' # Or 'CLOSED' if approval closes it
        deviation.save()

        return Response({
            "status": "success", 
            "message": f"Deviation {deviation.deviation_id} has been approved."
        })

    # --- ACTION 3: Reject (Under Review -> Draft) ---
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_deviation(self, request, pk=None):
        deviation = self.get_object()
        
        # Check permissions
        if request.user.role not in ['QA', 'Admin']:
             return Response({"error": "Only QA can reject."}, status=status.HTTP_403_FORBIDDEN)

        deviation.status = 'DRAFT' # Send back to draft for fixing
        deviation.save()

        return Response({
            "status": "returned", 
            "message": f"Deviation returned to owner for correction."
        })

class CapaViewSet(viewsets.ModelViewSet):
    queryset = Capa.objects.all().order_by('-created_at')
    serializer_class = CapaSerializer
    lookup_field = 'capa_id'
    
    def perform_create(self, serializer):
        serializer.save()

    # --- ACTION 1: Start Implementation (Planning -> Pending) ---
    @action(detail=True, methods=['post'], url_path='start')
    def start_capa(self, request, pk=None):
        capa = self.get_object()
        
        if capa.status != 'PLANNING':
            return Response({"error": "Only planned CAPAs can be started."}, status=400)

        capa.status = 'PENDING'
        capa.save()
        return Response({"message": f"CAPA {capa.capa_id} is now Pending Implementation."})

    # --- ACTION 2: Complete Work (Pending -> Completed) ---
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_capa(self, request, pk=None):
        capa = self.get_object()
        
        if capa.status != 'PENDING':
            return Response({"error": "CAPA must be Pending Implementation to mark as complete."}, status=400)

        capa.status = 'COMPLETED'
        capa.save()
        return Response({"message": f"CAPA {capa.capa_id} marked as Completed. Ready for verification."})
    
    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        record = self.get_object()
        target_status = request.data.get('target_status')
        
        # Log the audit trail here!
        # record.status = target_status
        # record.save()
        return Response({'status': 'transition successful'})
    
    # --- ACTION 3: QA Verification (Completed -> Verified) ---
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_capa(self, request, pk=None):
        capa = self.get_object()

        # Security Check: Only QA/Admin can verify
        if request.user.role not in ['QA', 'Admin']:
            return Response({"error": "Only QA can verify CAPAs."}, status=403)

        if capa.status != 'COMPLETED':
            return Response({"error": "CAPA must be Completed before verification."}, status=400)

        capa.status = 'VERIFIED'
        capa.save()
        
        # AUTOMATION: If all CAPAs for a deviation are closed, should we close the Deviation too?
        # Let's check!
        deviation = capa.deviation
        if deviation:
            # Check if any sibling CAPAs are NOT verified
            open_capas = deviation.capas.exclude(status='VERIFIED').exists()
            if not open_capas:
                deviation.status = 'CLOSED'
                deviation.save()
                return Response({
                    "message": f"CAPA {capa.capa_id} Verified. Deviation {deviation.deviation_id} is now CLOSED."
                })

        return Response({"message": f"CAPA {capa.capa_id} Verified."})
    
class ChangeControlViewSet(viewsets.ModelViewSet):
    queryset = ChangeControl.objects.all().order_by('-created_at')
    serializer_class = ChangeControlSerializer
    lookup_field = 'cc_id'
    
    def perform_create(self, serializer):
        # Automatically set the 'initiator' to the logged-in user
        serializer.save(initiator=self.request.user)
        
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_cc(self, request, pk=None):
        cc = self.get_object()
        if cc.status != 'DRAFT':
            return Response({"error": "Only drafts can be submitted."}, status=400)
        
        cc.status = 'EVALUATION'
        cc.save()
        return Response({"message": f"Change Control {cc.cc_id} submitted for Impact Evaluation."})

    # --- ACTION 2: Submit for Approval (Evaluation -> Approval) ---
    @action(detail=True, methods=['post'], url_path='request-approval')
    def request_approval(self, request, pk=None):
        cc = self.get_object()
        if cc.status != 'EVALUATION':
            return Response({"error": "CC must complete Evaluation first."}, status=400)
        
        cc.status = 'APPROVAL'
        cc.save()
        return Response({"message": f"Change Control {cc.cc_id} sent to QA/CCB for Approval."})

    # --- ACTION 3: Approve (Approval -> Implementation) ---
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_cc(self, request, pk=None):
        cc = self.get_object()
        
        # Security Check: Only QA/Admin
        if request.user.role not in ['QA', 'Admin']:
            return Response({"error": "Only QA or Admin can approve Change Controls."}, status=403)

        if cc.status != 'APPROVAL':
            return Response({"error": "CC is not pending approval."}, status=400)
        
        cc.status = 'IMPLEMENTATION'
        cc.save()
        return Response({"message": f"Change Control {cc.cc_id} APPROVED. Implementation may begin."})

    # --- ACTION 4: Close (Implementation -> Closed) ---
    @action(detail=True, methods=['post'], url_path='close')
    def close_cc(self, request, pk=None):
        cc = self.get_object()
        
        # Security Check
        if request.user.role not in ['QA', 'Admin']:
            return Response({"error": "Only QA can close a Change Control."}, status=403)

        if cc.status != 'IMPLEMENTATION':
            return Response({"error": "CC must be in Implementation phase to close."}, status=400)
        
        cc.status = 'CLOSED'
        cc.save()
        return Response({"message": f"Change Control {cc.cc_id} has been CLOSED."})