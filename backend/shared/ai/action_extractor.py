"""
Algorithm E — Action Extractor
Extracts structured action items from reviewer remark text.

Phase 1: Stub — returns empty list (no spaCy dependency yet).
Phase 3: Replace with real spaCy NLP pipeline.
"""
import re
from datetime import date, timedelta

ACTION_CATEGORIES = {
    'training': ['train', 'retrain', 'education', 'awareness', 'briefing'],
    'validation': ['validate', 'revalidate', 'qualification', 'qualify', 'ivq', 'iq', 'oq', 'pq'],
    'documentation': ['update sop', 'revise procedure', 'amend document', 'update protocol', 'document', 'record'],
    'investigation': ['investigate', 'root cause', 'rca', 'analyse', 'analyze', 'review'],
    'regulatory_filing': ['submit', 'notify fda', 'file', 'report to', 'regulatory submission', 'mdr'],
    'implementation': ['implement', 'install', 'procure', 'purchase', 'replace', 'repair', 'fix'],
}

ROLE_BY_CATEGORY = {
    'training': 'qa_manager',
    'validation': 'qc',
    'documentation': 'qa_executive',
    'investigation': 'qa_manager',
    'regulatory_filing': 'qa_head',
    'implementation': 'production',
}

DEFAULT_DUE_DAYS = {
    'training': 30,
    'validation': 45,
    'documentation': 14,
    'investigation': 21,
    'regulatory_filing': 15,
    'implementation': 30,
}

STUB_MODE = True  # Set to False in Phase 3 when spaCy is installed


def extract_actions(remark_texts: list[str]) -> list[dict]:
    """
    Extract structured action items from a list of reviewer remarks.

    Args:
        remark_texts: List of approval remark strings from all stages

    Returns:
        List of:
        {
            'action': str,
            'category': str,
            'suggested_owner_role': str,
            'suggested_due_date': str (ISO date),
            'source_remark_index': int,
        }
    """
    if STUB_MODE:
        return _stub_extract(remark_texts)
    return _spacy_extract(remark_texts)


def _stub_extract(remark_texts: list[str]) -> list[dict]:
    """
    Simple regex-based extraction for Phase 1.
    Finds sentences with action verbs and categorises them.
    """
    results = []
    today = date.today()

    for idx, text in enumerate(remark_texts):
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            sentence_lower = sentence.lower()
            for category, keywords in ACTION_CATEGORIES.items():
                if any(kw in sentence_lower for kw in keywords):
                    due_days = DEFAULT_DUE_DAYS[category]
                    results.append({
                        'action': sentence[:200],
                        'category': category,
                        'suggested_owner_role': ROLE_BY_CATEGORY[category],
                        'suggested_due_date': (today + timedelta(days=due_days)).isoformat(),
                        'source_remark_index': idx,
                    })
                    break  # One category per sentence

    return results


def _spacy_extract(remark_texts: list[str]) -> list[dict]:
    """Phase 3 — real spaCy NLP pipeline."""
    try:
        import spacy
        nlp = spacy.load('en_core_web_sm')
    except Exception:
        return _stub_extract(remark_texts)

    results = []
    today = date.today()

    for idx, text in enumerate(remark_texts):
        doc = nlp(text)
        for sent in doc.sents:
            sent_lower = sent.text.lower()
            for category, keywords in ACTION_CATEGORIES.items():
                if any(kw in sent_lower for kw in keywords):
                    due_days = DEFAULT_DUE_DAYS[category]
                    results.append({
                        'action': sent.text.strip()[:200],
                        'category': category,
                        'suggested_owner_role': ROLE_BY_CATEGORY[category],
                        'suggested_due_date': (today + timedelta(days=due_days)).isoformat(),
                        'source_remark_index': idx,
                    })
                    break

    return results
