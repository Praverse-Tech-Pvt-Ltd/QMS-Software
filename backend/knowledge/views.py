from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import SOPChunk, FDA483Observation
from .sop_ingestion import ingest_sop_file


class SOPUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'file is required'}, status=400)

        role = getattr(request.user, 'role', '')
        if role not in ('Admin', 'QA Head', 'QA Manager'):
            return Response({'error': 'Only QA Head, QA Manager, or Admin can upload SOPs'}, status=403)

        sop_name = request.data.get('sop_name', file.name)
        version = request.data.get('version', '1.0')
        department = request.data.get('department', '')
        effective_date = request.data.get('effective_date') or None

        try:
            chunk_count = ingest_sop_file(file, sop_name, version, department, request.user, effective_date)
            return Response({
                'status': 'success',
                'sop_name': sop_name,
                'version': version,
                'chunks_created': chunk_count,
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class SOPListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department = request.GET.get('department', '')
        qs = SOPChunk.objects.filter(is_active=True)
        if department:
            qs = qs.filter(department=department)

        sops = {}
        for chunk in qs:
            key = (chunk.sop_name, chunk.sop_version)
            if key not in sops:
                sops[key] = {
                    'sop_name': chunk.sop_name,
                    'version': chunk.sop_version,
                    'department': chunk.department,
                    'effective_date': chunk.effective_date,
                    'chunk_count': 0,
                    'uploaded_by': getattr(chunk.uploaded_by, 'username', None),
                    'created_at': chunk.created_at,
                }
            sops[key]['chunk_count'] += 1

        results = sorted(sops.values(), key=lambda s: s['created_at'], reverse=True)
        return Response(results)


class SOPQueryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('query') or request.GET.get('q', '')
        department = request.GET.get('department', '')
        top_k = int(request.GET.get('top_k', 5))

        if not query:
            return Response({'error': 'query parameter required'}, status=400)

        qs = SOPChunk.objects.filter(is_active=True)
        if department:
            qs = qs.filter(department=department)

        # Simple text search for Phase 1 (pgvector cosine similarity in Phase 3)
        chunks = list(qs.filter(chunk_text__icontains=query)[:top_k])
        results = [
            {
                'id': chunk.id,
                'source_filename': f"{chunk.sop_name} v{chunk.sop_version}",
                'chunk_index': idx,
                'text': chunk.chunk_text,
            }
            for idx, chunk in enumerate(chunks)
        ]
        return Response({'query': query, 'results': results})


class FDARiskView(APIView):
    permission_classes = [IsAuthenticated]

    OUTCOME_RISK = {
        'warning_letter': 'Critical',
        '483': 'High',
        'vai': 'Medium',
        'nai': 'Low',
    }

    def get(self, request):
        query = request.GET.get('query', '')
        product_category = request.GET.get('product_category', '')

        qs = FDA483Observation.objects.all()
        if product_category:
            qs = qs.filter(product_category__icontains=product_category)
        if query:
            qs = qs.filter(observation_text__icontains=query)

        results = qs[:10]
        return Response([
            {
                'id': obs.id,
                'citation_number': obs.cfr_section or f"FDA-{obs.id}",
                'description': obs.observation_text,
                'facility_type': obs.product_category,
                'date_issued': f"{obs.year}-01-01" if obs.year else None,
                'risk_level': self.OUTCOME_RISK.get(obs.outcome, 'Medium'),
            }
            for obs in results
        ])
