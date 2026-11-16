from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import mbr_generator, regulatory_triggers
from .stage_library import LIBRARY, LIBRARY_STATUS, available_forms


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stage_library(request):
    """List dosage forms; ?form=<key> returns the full stage list."""
    form = request.query_params.get('form')
    if form:
        if form not in LIBRARY:
            return Response({'error': f'Unknown dosage form "{form}".'}, status=404)
        return Response({'library_status': LIBRARY_STATUS, 'form': form, **LIBRARY[form]})
    return Response({'library_status': LIBRARY_STATUS, 'forms': available_forms()})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mbr_skeleton(request):
    """Build (not save) an MBR skeleton and validate it. Body: product, dosage_form, batch_size,
    parameters, excluded_stage_keys, theoretical_yield, yield_formula."""
    d = request.data
    if not d.get('product') or not d.get('dosage_form'):
        return Response({'error': 'product and dosage_form are required.'}, status=400)
    try:
        sk = mbr_generator.build_skeleton(
            d['product'], d['dosage_form'], d.get('batch_size', ''),
            d.get('parameters'), d.get('excluded_stage_keys'))
    except mbr_generator.UnknownDosageForm as e:
        return Response({'error': str(e)}, status=400)
    check = mbr_generator.validate_skeleton(sk, d.get('theoretical_yield'), d.get('yield_formula', ''))
    return Response({'skeleton': sk, 'validation': check})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mbr_create(request):
    """Persist a draft MBR from a skeleton request. Blocks if validation has blocking items."""
    d = request.data
    if not d.get('product') or not d.get('dosage_form') or not d.get('version'):
        return Response({'error': 'product, dosage_form and version are required.'}, status=400)
    try:
        sk = mbr_generator.build_skeleton(
            d['product'], d['dosage_form'], d.get('batch_size', ''),
            d.get('parameters'), d.get('excluded_stage_keys'))
    except mbr_generator.UnknownDosageForm as e:
        return Response({'error': str(e)}, status=400)
    check = mbr_generator.validate_skeleton(sk, d.get('theoretical_yield'), d.get('yield_formula', ''))
    if check['blocking']:
        return Response({'error': 'MBR has blocking validation items.', 'validation': check}, status=422)

    from batch_records.models import MasterBatchRecord
    if MasterBatchRecord.objects.filter(product=d['product'], version=d['version']).exists():
        return Response({'error': 'An MBR with this product and version already exists.'}, status=409)
    mbr = mbr_generator.persist_mbr(sk, d['version'], request.user, d.get('theoretical_yield'), d.get('yield_formula', ''))
    return Response({'id': str(mbr.pk), 'status': mbr.status, 'steps': mbr.steps.count(),
                     'validation': check}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regulatory_triggers_view(request):
    """Triage a change against the draft regulatory-trigger ruleset."""
    return Response(regulatory_triggers.evaluate(request.data))
