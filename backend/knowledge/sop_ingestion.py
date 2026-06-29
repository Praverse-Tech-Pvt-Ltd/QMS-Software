"""
SOP ingestion pipeline.
Phase 1: text extraction + chunking (no embeddings yet).
Phase 3: add OpenAI embedding call and store in pgvector column.
"""
import io
from .models import SOPChunk

CHUNK_SIZE = 500  # characters (~400-600 tokens)
CHUNK_OVERLAP = 50


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
        if len(chunk_text.strip()) > 50:  # skip very short chunks
            SOPChunk.objects.create(
                sop_name=sop_name,
                sop_version=version,
                chunk_text=chunk_text.strip(),
                department=department,
                effective_date=effective_date,
                uploaded_by=user,
                is_active=True,
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
