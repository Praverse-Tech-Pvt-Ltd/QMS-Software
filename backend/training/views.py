import io

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import TrainingPlan, TrainingAssignment
from .serializers import TrainingPlanSerializer, TrainingAssignmentSerializer
from django.contrib.auth import get_user_model


def generate_certificate_pdf(assignment) -> io.BytesIO:
    """Render a Certificate of Training Completion PDF. Pattern: laboratory.views.generate_coa_pdf."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=20 * mm, leftMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
    )
    styles = getSampleStyleSheet()
    elements = []

    user = assignment.user
    employee_name = user.get_full_name() or user.username

    elements.append(Paragraph(
        'NexGen Pharma',
        ParagraphStyle('Company', fontSize=14, fontName='Helvetica-Bold', alignment=1, spaceAfter=2)
    ))
    elements.append(Paragraph(
        'CERTIFICATE OF TRAINING COMPLETION',
        ParagraphStyle('CertTitle', fontSize=13, fontName='Helvetica-Bold', alignment=1,
                        spaceAfter=6, textColor=colors.HexColor('#1a3a5c'))
    ))
    elements.append(HRFlowable(width='100%', thickness=1.5, color=colors.HexColor('#1a3a5c')))
    elements.append(Spacer(1, 4 * mm))

    rows = [
        ['Employee Name', employee_name],
        ['Role / Department', f'{user.role} — {user.department or "N/A"}'],
        ['SOP / Document Trained', assignment.plan.title],
        ['Completion Date', str(assignment.completion_date or '-')],
        ['Quiz Score', f'{assignment.score}%' if assignment.score is not None else 'N/A'],
        ['Result', 'PASSED' if assignment.quiz_passed or (assignment.score or 0) >= 80 else 'RECORDED'],
    ]
    table = Table(rows, colWidths=[55 * mm, 120 * mm])
    table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eef2f7')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 6 * mm))

    elements.append(Paragraph(
        f'Issued by: NexGen QMS on {timezone.now().date()}',
        ParagraphStyle('Issued', fontSize=9, fontName='Helvetica-Oblique', textColor=colors.HexColor('#555555'))
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        'This certificate is a computer-generated record produced by NexGen QMS. '
        'It is subject to 21 CFR Part 11 electronic record controls.',
        ParagraphStyle('Footer', fontSize=6.5, fontName='Helvetica-Oblique', textColor=colors.HexColor('#666666'))
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer

class TrainingPlanViewSet(viewsets.ModelViewSet):
    queryset = TrainingPlan.objects.all()
    serializer_class = TrainingPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Allows lookup via numeric ID or 'TRN-X' / 'PLAN-X' prefixes"""
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs[self.lookup_url_kwarg or self.lookup_field]

        if isinstance(lookup_value, str):
            # Strip common prefixes used in the frontend
            clean_id = lookup_value.replace('TRN-', '').replace('PLAN-', '')
            try:
                obj = get_object_or_404(queryset, pk=int(clean_id))
            except ValueError:
                obj = get_object_or_404(queryset, **{self.lookup_field: lookup_value})
        else:
            obj = get_object_or_404(queryset, **{self.lookup_field: lookup_value})

        self.check_object_permissions(self.request, obj)
        return obj

    # ✅ FIXED: Added this action to handle /api/training/plans/{id}/assignments/
    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        plan = self.get_object()
        assignments = TrainingAssignment.objects.filter(plan=plan).select_related('user')
        serializer = TrainingAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        plan = self.get_object()
        user_id = request.data.get('user_id')
        due_date = request.data.get('due_date')

        if not user_id or not due_date:
            return Response({"error": "User ID and Due Date are required"}, status=400)

        try:
            User = get_user_model()
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if TrainingAssignment.objects.filter(plan=plan, user=user, status__in=['PENDING', 'OVERDUE']).exists():
            return Response({"error": f"Already assigned to {user.first_name}."}, status=400)

        assignment = TrainingAssignment.objects.create(
            plan=plan, user=user, due_date=due_date, status='PENDING'
        )
        return Response({"assignment_id": assignment.id}, status=201)

class TrainingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingAssignment.objects.all()
    serializer_class = TrainingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Admin', 'QA']:
            return TrainingAssignment.objects.all()
        return TrainingAssignment.objects.filter(user=user)

    @action(detail=False, methods=['get'], url_path='my-tasks')
    def my_tasks(self, request):
        """
        Pending (not yet COMPLETED) training assignments for the current user,
        most urgent first. Matches the flat-array contract already expected by
        trainingService.getMyAssignments() on the frontend.
        """
        qs = TrainingAssignment.objects.filter(
            user=request.user,
        ).exclude(status='COMPLETED').select_related('plan').order_by('due_date')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = 'COMPLETED'
        assignment.completion_date = timezone.now().date()
        assignment.score = request.data.get('score', 100)
        assignment.save()
        return Response({'status': 'Training Completed'})

    @action(detail=True, methods=['post'], url_path='generate-quiz')
    def generate_quiz(self, request, pk=None):
        from knowledge.sop_ingestion import query_sops
        from shared.ai.remark_generator import generate_quiz_from_sop

        assignment = self.get_object()
        sop_name = assignment.plan.title

        sop_chunks = query_sops(sop_name)
        if not sop_chunks:
            return Response({'error': 'SOP not indexed. Upload this SOP first.'}, status=400)

        questions = generate_quiz_from_sop(sop_name, sop_chunks)
        if not questions:
            return Response({'error': 'Quiz generation failed or AI is unavailable. Try again later.'}, status=503)

        assignment.quiz_questions = questions
        assignment.quiz_passed = False
        assignment.save(update_fields=['quiz_questions', 'quiz_passed', 'updated_at'])
        return Response({'quiz_questions': questions})

    @action(detail=True, methods=['post'], url_path='submit-quiz')
    def submit_quiz(self, request, pk=None):
        assignment = self.get_object()
        questions = assignment.quiz_questions or []
        if not questions:
            return Response({'error': 'No quiz generated for this assignment yet.'}, status=400)

        answers = request.data.get('answers', [])
        if not isinstance(answers, list):
            return Response({'error': 'answers must be a list of selected option indices'}, status=400)

        correct = []
        for i, q in enumerate(questions):
            selected = answers[i] if i < len(answers) else None
            correct.append(selected == q.get('correct_index'))

        score_percent = round((sum(correct) / len(questions)) * 100, 1) if questions else 0.0
        passed = score_percent >= 80.0

        assignment.quiz_passed = passed
        assignment.score = int(score_percent)
        assignment.save(update_fields=['quiz_passed', 'score', 'updated_at'])

        return Response({
            'score_percent': score_percent,
            'passed': passed,
            'correct': correct,
        })

    @action(detail=True, methods=['get'], url_path='certificate')
    def certificate(self, request, pk=None):
        assignment = self.get_object()
        if assignment.status != 'COMPLETED':
            return Response({'error': 'Certificate is only available for completed training.'}, status=400)

        buf = generate_certificate_pdf(assignment)
        response = HttpResponse(buf.read(), content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="Certificate-{assignment.user.username}-{assignment.plan.id}.pdf"'
        )
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def training_calendar(request):
    """
    GET /api/training/calendar/?month=YYYY-MM
    Returns assignments due in the given month, grouped by due_date.
    """
    month_param = request.query_params.get('month')
    if not month_param:
        return Response({'error': 'month parameter is required (format YYYY-MM)'}, status=400)

    try:
        year, month = (int(x) for x in month_param.split('-'))
    except ValueError:
        return Response({'error': 'month must be in YYYY-MM format'}, status=400)

    qs = TrainingAssignment.objects.filter(
        due_date__year=year, due_date__month=month,
    ).select_related('plan', 'user').order_by('due_date')

    grouped = {}
    for assignment in qs:
        day = assignment.due_date.isoformat()
        grouped.setdefault(day, []).append({
            'id': assignment.id,
            'plan_title': assignment.plan.title,
            'user': assignment.user.get_full_name() or assignment.user.username,
            'status': assignment.status,
        })

    return Response(grouped)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_training_history(request):
    user = request.user
    if user.role in ['Admin', 'QA', 'Manager']:
        assignments = TrainingAssignment.objects.all().select_related('plan', 'user').order_by('-due_date')
    else:
        assignments = TrainingAssignment.objects.filter(user=user).select_related('plan').order_by('-due_date')
    
    data = []
    for t in assignments:
        data.append({
            "id": f"TRN-{t.plan.id}", 
            "record_id": t.plan.id,   
            "assignment_id": t.id,    
            "title": t.plan.title,
            "department": t.plan.department,
            "status": t.status, 
            "due_date": t.due_date,
            "completion_date": t.completion_date,
            "score": t.score,
            "assigned_to": f"{t.user.first_name} {t.user.last_name}" 
        })
    return Response(data)