from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .ai.questionnaire import get_next_questions
from .ai.remark_generator import generate_remark
from .ai.action_extractor import extract_actions
from .models import ActionItem
from .serializers import ActionItemSerializer

# Roles permitted to create/update/close/extend action items — matches the
# QA-staff convention already used elsewhere in this codebase (e.g. knowledge/views.py).
QA_STAFF_ROLES = ('Admin', 'QA', 'QA Head', 'QA Manager', 'QA Executive')


class QuestionnaireView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        module = request.data.get('module', '')
        event_type = request.data.get('event_type', '')
        answers = request.data.get('answers', {})

        if not module:
            return Response({'error': 'module is required'}, status=400)

        result = get_next_questions(module, event_type, answers)
        return Response(result)


class RemarkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        module = request.data.get('module', '')
        record_id = request.data.get('record_id', '')
        approver_role = request.data.get('approver_role', request.user.role)
        stage = request.data.get('stage', '')
        risk_level = request.data.get('risk_level', 'Medium')
        summary = request.data.get('summary', '')

        result = generate_remark(
            module=module,
            record_id=record_id,
            approver_role=approver_role,
            stage=stage,
            risk_level=risk_level,
            summary=summary,
        )
        return Response(result)


class ExtractActionsView(APIView):
    """
    Runs Algorithm E over the given remark texts, then persists the results as
    ActionItem records (get_or_create, so re-running on the same record never
    duplicates items). If record_type/record_id are omitted, falls back to the
    pre-Phase-4 behavior of returning ephemeral (unpersisted) results.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        remark_texts = request.data.get('remark_texts', [])
        if not isinstance(remark_texts, list):
            return Response({'error': 'remark_texts must be a list'}, status=400)

        actions = extract_actions(remark_texts)

        record_type = request.data.get('record_type')
        record_id = request.data.get('record_id')
        if not record_type or not record_id:
            return Response({'actions': actions})

        items = []
        for action in actions:
            item, _ = ActionItem.objects.get_or_create(
                record_type=record_type,
                record_id=str(record_id),
                action=action['action'],
                defaults={
                    'category': action['category'],
                    'suggested_owner_role': action['suggested_owner_role'],
                    'due_date': action['suggested_due_date'],
                    'status': 'open',
                    'source_remark': remark_texts[action.get('source_remark_index', 0)]
                        if remark_texts else '',
                    'created_by': request.user,
                    'modified_by': request.user,
                },
            )
            items.append(item)

        return Response(ActionItemSerializer(items, many=True).data, status=201)


class ActionItemListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        record_type = request.query_params.get('record_type')
        record_id = request.query_params.get('record_id')

        qs = ActionItem.objects.filter(is_active=True)
        if record_type:
            qs = qs.filter(record_type=record_type)
        if record_id:
            qs = qs.filter(record_id=record_id)

        role = getattr(request.user, 'role', '')
        if role not in QA_STAFF_ROLES:
            qs = qs.filter(assigned_to=request.user)

        return Response(ActionItemSerializer(qs, many=True).data)

    def post(self, request):
        role = getattr(request.user, 'role', '')
        if role not in QA_STAFF_ROLES:
            return Response({'error': 'Insufficient permissions'}, status=403)

        serializer = ActionItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save(created_by=request.user, modified_by=request.user)
            return Response(ActionItemSerializer(item).data, status=201)
        return Response(serializer.errors, status=400)


class ActionItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return ActionItem.objects.get(pk=pk, is_active=True)

    def patch(self, request, pk=None):
        role = getattr(request.user, 'role', '')
        if role not in QA_STAFF_ROLES:
            return Response({'error': 'Insufficient permissions'}, status=403)

        try:
            item = self.get_object(pk)
        except ActionItem.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        serializer = ActionItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(modified_by=request.user)
            return Response(ActionItemSerializer(item).data)
        return Response(serializer.errors, status=400)


class ActionItemCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        role = getattr(request.user, 'role', '')
        if role not in QA_STAFF_ROLES:
            return Response({'error': 'Insufficient permissions'}, status=403)

        evidence_note = request.data.get('evidence_note', '')
        if len(evidence_note.strip()) < 20:
            return Response({'error': 'evidence_note must be at least 20 characters'}, status=400)

        try:
            item = ActionItem.objects.get(pk=pk, is_active=True)
        except ActionItem.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        item.status = 'closed'
        item.evidence_note = evidence_note
        item.modified_by = request.user
        item.save(update_fields=['status', 'evidence_note', 'modified_by', 'updated_at'])
        return Response(ActionItemSerializer(item).data)


class ActionItemExtendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        role = getattr(request.user, 'role', '')
        if role not in QA_STAFF_ROLES:
            return Response({'error': 'Insufficient permissions'}, status=403)

        due_date = request.data.get('due_date')
        extension_reason = request.data.get('extension_reason', '')
        if not due_date:
            return Response({'error': 'due_date is required'}, status=400)
        if len(extension_reason.strip()) < 30:
            return Response({'error': 'extension_reason must be at least 30 characters'}, status=400)

        try:
            item = ActionItem.objects.get(pk=pk, is_active=True)
        except ActionItem.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        item.due_date = due_date
        item.extension_reason = extension_reason
        item.status = 'extended'
        item.modified_by = request.user
        item.save(update_fields=['due_date', 'extension_reason', 'status', 'modified_by', 'updated_at'])
        return Response(ActionItemSerializer(item).data)
