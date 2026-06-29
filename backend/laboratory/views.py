import io
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Sample, TestRequest, TestResult, COATemplate
from .serializers import SampleSerializer, TestRequestSerializer, TestResultSerializer
from shared.workflow import transition


def generate_coa_pdf(sample, test_results, template=None, site=None) -> io.BytesIO:
    """Render a Certificate of Analysis PDF for a sample's test results."""
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

    company_name = (site.name if site else None) or 'NexGen Pharma'
    header_text = template.header_text if template else ''
    footer_text = template.footer_text if template else ''

    elements.append(Paragraph(
        company_name,
        ParagraphStyle('Company', fontSize=14, fontName='Helvetica-Bold', alignment=1, spaceAfter=2)
    ))
    elements.append(Paragraph(
        'CERTIFICATE OF ANALYSIS',
        ParagraphStyle('COATitle', fontSize=13, fontName='Helvetica-Bold', alignment=1,
                        spaceAfter=6, textColor=colors.HexColor('#1a3a5c'))
    ))
    if header_text:
        elements.append(Paragraph(header_text, styles['Normal']))
    elements.append(HRFlowable(width='100%', thickness=1.5, color=colors.HexColor('#1a3a5c')))
    elements.append(Spacer(1, 4 * mm))

    batch_rows = [
        ['Product Name', sample.product or '-'],
        ['Batch / Lot No.', sample.batch_lot or '-'],
        ['Sample Number', sample.sample_number or '-'],
        ['Sample Type', sample.get_sample_type_display() if hasattr(sample, 'get_sample_type_display') else sample.sample_type],
        ['Received Date', str(sample.received_date or '-')],
    ]
    batch_table = Table(batch_rows, colWidths=[55 * mm, 120 * mm])
    batch_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eef2f7')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(batch_table)
    elements.append(Spacer(1, 5 * mm))

    elements.append(Paragraph(
        'Test Results',
        ParagraphStyle('SectionHead', fontSize=10, fontName='Helvetica-Bold',
                        spaceAfter=3, textColor=colors.HexColor('#1a3a5c'))
    ))
    result_headers = ['Test Name', 'Method', 'Specification', 'Result', 'Unit', 'Status']
    result_data = [result_headers]

    all_pass = True
    for r in test_results:
        test_request = r.test_request
        test_name = test_request.test_name if test_request else '-'
        method = test_request.method if test_request else '-'
        lo, hi = r.specification_lower, r.specification_upper
        spec = f"{lo} – {hi}" if lo is not None and hi is not None else '-'

        pf = r.pass_fail
        if pf == 'fail':
            all_pass = False

        result_data.append([test_name, method, spec, str(r.result_value), r.unit or '-', pf.upper()])

    result_table = Table(result_data, colWidths=[45 * mm, 30 * mm, 35 * mm, 25 * mm, 15 * mm, 18 * mm], repeatRows=1)
    result_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a3a5c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cccccc')),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(result_table)
    elements.append(Spacer(1, 5 * mm))

    conclusion_text = 'APPROVED FOR RELEASE' if all_pass else 'REJECTED — NOT FOR RELEASE'
    conclusion_color = colors.HexColor('#1b5e20') if all_pass else colors.HexColor('#b71c1c')
    elements.append(Paragraph(
        conclusion_text,
        ParagraphStyle('Conclusion', fontSize=12, fontName='Helvetica-Bold',
                        textColor=conclusion_color, spaceAfter=4)
    ))
    elements.append(HRFlowable(width='100%', thickness=0.5, color=colors.grey))
    elements.append(Spacer(1, 4 * mm))

    if footer_text:
        elements.append(Paragraph(footer_text, styles['Normal']))
        elements.append(Spacer(1, 3 * mm))

    elements.append(Paragraph(
        'This Certificate of Analysis is a computer-generated record produced by NexGen QMS. '
        'It is subject to 21 CFR Part 11 electronic record controls.',
        ParagraphStyle('Footer', fontSize=6.5, fontName='Helvetica-Oblique', textColor=colors.HexColor('#666666'))
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer


class SampleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SampleSerializer

    def get_queryset(self):
        return Sample.objects.filter(is_active=True).order_by('-received_date')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def do_transition(self, request, pk=None):
        sample = self.get_object()
        action_name = request.data.get('action')
        reason = request.data.get('reason', '')
        esig_password = request.data.get('esig_password')
        try:
            transition(sample, action_name, request.user, reason, esig_password)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        return Response(SampleSerializer(sample).data)

    @action(detail=True, methods=['post'], url_path='results')
    def add_result(self, request, pk=None):
        sample = self.get_object()
        # Find the relevant test request
        test_request_id = request.data.get('test_request_id')
        try:
            test_request = sample.test_requests.get(id=test_request_id)
        except TestRequest.DoesNotExist:
            return Response({'error': 'Test request not found'}, status=404)

        serializer = TestResultSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save(
                test_request=test_request,
                created_by=request.user,
                modified_by=request.user,
            )
            oos_id = None
            if result.pass_fail == 'fail':
                from quality.models import OOSInvestigation
                oos = OOSInvestigation.objects.filter(linked_test_result=result).first()
                oos_id = str(oos.id) if oos else None
            return Response({
                'result': TestResultSerializer(result).data,
                'pass_fail': result.pass_fail,
                'oos_triggered': result.pass_fail == 'fail',
                'oos_id': oos_id,
            }, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], url_path='coa')
    def generate_coa(self, request, pk=None):
        sample = self.get_object()
        test_results = TestResult.objects.filter(test_request__sample=sample).select_related('test_request')
        if not test_results.exists():
            return Response({'error': 'No test results recorded for this sample yet.'}, status=400)

        template = COATemplate.objects.filter(product=sample.product, is_active=True).first()
        buf = generate_coa_pdf(sample, test_results, template=template, site=sample.site)
        response = HttpResponse(buf.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="COA-{sample.sample_number}-{sample.batch_lot}.pdf"'
        return response


class TestRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TestRequestSerializer

    def get_queryset(self):
        return TestRequest.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, modified_by=self.request.user)
