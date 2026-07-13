"""
SOP ingestion pipeline.
Phase 1: text extraction + chunking (no embeddings yet).
Phase 6: local sentence-transformers embedding (all-MiniLM-L6-v2, 384 dim) —
stored as JSON on `embedding_json`, matching the rest of this app (see
knowledge/models.py — there is no ORM VectorField in use; the pgvector
`embedding` columns added in migration 0002 are raw-SQL-only and unused).
"""
import io
import json
import os

from .models import SOPChunk

CHUNK_SIZE = 500  # characters (~400-600 tokens)
CHUNK_OVERLAP = 50

_EMBED_MODEL_NAME = os.environ.get('LOCAL_EMBED_MODEL', 'all-MiniLM-L6-v2')
_embed_model = None


def _get_embed_model():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
    return _embed_model


def embed_text(text: str) -> list[float]:
    """Local embedding — no API cost, no network call, CPU-only. 384 dimensions."""
    return _get_embed_model().encode(text, normalize_embeddings=True).tolist()


def ingest_sop_file(file, sop_name: str, version: str, department: str, user, effective_date=None) -> int:
    """
    Parse, chunk, and store SOP file.
    Returns number of chunks created.
    """
    filename = file.name.lower()
    if filename.endswith('.pdf'):
        text = _extract_pdf(file)
    elif filename.endswith('.docx'):
        text = _extract_docx(file)
    else:
        raise ValueError(f'Unsupported file type: {file.name}. Use PDF or DOCX.')

    if not text.strip():
        raise ValueError('No text could be extracted from the file.')

    # Mark old chunks for this SOP as inactive
    SOPChunk.objects.filter(sop_name=sop_name, is_active=True).update(is_active=False)

    chunks = _chunk_text(text)
    created = 0
    for chunk_text in chunks:
        stripped = chunk_text.strip()
        if len(stripped) > 50:  # skip very short chunks
            embedding_json = ''
            try:
                embedding_json = json.dumps(embed_text(stripped))
            except Exception:
                pass  # AI never blocks — SOP is still stored and searchable by text

            SOPChunk.objects.create(
                sop_name=sop_name,
                sop_version=version,
                chunk_text=stripped,
                department=department,
                effective_date=effective_date,
                uploaded_by=user,
                is_active=True,
                embedding_json=embedding_json,
            )
            created += 1

    return created


def query_sops(sop_name: str, limit: int = 5) -> list[str]:
    """
    Return up to `limit` active chunk texts for the given SOP name
    (case-insensitive partial match). Used by training quiz generation.
    """
    chunks = (
        SOPChunk.objects.filter(sop_name__icontains=sop_name, is_active=True)
        .order_by('-created_at')[:limit]
    )
    return [c.chunk_text for c in chunks]


def _extract_pdf(file) -> str:
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        return '\n'.join(text_parts)
    except ImportError:
        raise ValueError('pdfplumber not installed. Run: pip install pdfplumber')


def _extract_docx(file) -> str:
    try:
        from docx import Document
        doc = Document(file)
        return '\n'.join(para.text for para in doc.paragraphs if para.text.strip())
    except ImportError:
        raise ValueError('python-docx not installed. Run: pip install python-docx')


def _chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks of ~CHUNK_SIZE characters."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append(chunk)
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks
