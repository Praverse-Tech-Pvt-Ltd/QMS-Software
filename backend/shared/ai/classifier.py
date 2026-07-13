"""
Algorithm A — Event Classifier
Classifies a free-text quality event into event_type, sub_category, and initial risk_level.
Phase 1: rule-based keyword matching.
Phase 2: replace with scikit-learn logistic regression trained on labelled pharma events.
Phase 6: transparent fine-tuned model hook — loads ml/models/classifier/ if present,
falls back to the keyword map unchanged if it doesn't exist or fails to load. No model
training happens in this phase; this is provisioning only.
"""
from pathlib import Path

_MODEL_PATH = Path(__file__).resolve().parents[3] / 'ml' / 'models' / 'classifier'
_clf = None


def _load_trained():
    global _clf
    if _clf is not None:
        return _clf
    if not _MODEL_PATH.exists():
        return None
    try:
        from transformers import pipeline
        _clf = pipeline(
            'text-classification', model=str(_MODEL_PATH),
            device=-1, truncation=True, max_length=256,
        )
        return _clf
    except Exception:
        return None


KEYWORD_MAP = {
    'deviation': {
        'keywords': ['deviation', 'deviat', 'out of procedure', 'process error', 'batch failure'],
        'sub_categories': {
            'equipment': ['equipment', 'instrument', 'machine', 'calibration'],
            'process': ['process', 'procedure', 'sop', 'protocol'],
            'material': ['material', 'raw material', 'excipient', 'ingredient'],
            'documentation': ['documentation', 'record', 'data entry', 'transcription'],
        },
    },
    'oos': {
        'keywords': ['oos', 'out of spec', 'outside specification', 'failed test', 'test failure', 'result outside', 'result failed'],
        'sub_categories': {
            'assay': ['assay', 'potency', 'content uniformity', 'dissolution'],
            'microbiological': ['microbial', 'sterility', 'endotoxin', 'bioburden'],
            'physical': ['appearance', 'hardness', 'friability', 'weight variation'],
            'chemical': ['impurity', 'degradation', 'related substance', 'heavy metal'],
        },
    },
    'complaint': {
        'keywords': ['complaint', 'customer complaint', 'adverse event', 'product complaint', 'field complaint', 'market complaint'],
        'sub_categories': {
            'efficacy': ['efficacy', 'effectiveness', 'not working', 'no effect'],
            'safety': ['adverse', 'side effect', 'injury', 'harm', 'reaction'],
            'quality': ['contamination', 'foreign', 'discoloured', 'broken', 'damaged'],
            'packaging': ['packaging', 'label', 'seal', 'leakage'],
        },
    },
    'nonconformance': {
        'keywords': ['nonconformance', 'non-conformance', 'nc', 'rejection', 'reject', 'failed inspection', 'defect'],
        'sub_categories': {
            'physical_defect': ['physical', 'crack', 'chip', 'broken', 'deformed'],
            'contamination': ['contamination', 'foreign matter', 'particle', 'particulate'],
            'documentation': ['documentation', 'missing record', 'incomplete'],
            'labelling': ['label', 'labelling', 'incorrect label'],
        },
    },
    'audit': {
        'keywords': ['audit', 'inspection', 'regulatory inspection', 'fda inspection', 'supplier audit', 'internal audit'],
        'sub_categories': {
            'internal': ['internal', 'self-inspection', 'self inspection'],
            'external': ['external', 'regulatory', 'fda', 'eu gmp', 'mhra'],
            'supplier': ['supplier', 'vendor', 'contract manufacturer', 'cmo'],
        },
    },
    'change_control': {
        'keywords': ['change control', 'change request', 'process change', 'equipment change', 'site change', 'formula change'],
        'sub_categories': {
            'process': ['process', 'manufacturing', 'procedure'],
            'equipment': ['equipment', 'instrument', 'facility'],
            'product': ['formula', 'formulation', 'ingredient', 'specification'],
            'supplier': ['supplier', 'vendor', 'raw material source'],
        },
    },
}

RISK_KEYWORDS = {
    'Critical': ['critical', 'patient safety', 'sterility failure', 'life threatening', 'recall', 'mdr', 'regulatory action'],
    'High': ['major', 'high risk', 'oos confirmed', 'repeat', 'systemic', 'multiple batches'],
    'Medium': ['moderate', 'medium', 'isolated', 'single batch'],
    'Low': ['minor', 'low', 'administrative', 'documentation only', 'observation'],
}


def classify_event(text: str) -> dict:
    """
    Classify a free-text quality event description.

    Returns:
        {
            'event_type': str,       # deviation | oos | complaint | nonconformance | audit | change_control | unknown
            'sub_category': str,     # specific sub-category or 'general'
            'risk_level': str,       # Low | Medium | High | Critical
        }
    """
    clf = _load_trained()
    if clf:
        try:
            res = clf(text[:512])[0]
            text_lower = text.lower()
            event_type = res['label']
            return {
                'event_type': event_type,
                'sub_category': _sub_category_for(event_type, text_lower),
                'risk_level': _risk_level_for(text_lower),
            }
        except Exception:
            pass  # fine-tuned model failed at inference — fall back transparently

    return _keyword_classify(text)


def _sub_category_for(event_type: str, text_lower: str) -> str:
    sub_categories = KEYWORD_MAP.get(event_type, {}).get('sub_categories', {})
    for sub, sub_kws in sub_categories.items():
        if any(kw in text_lower for kw in sub_kws):
            return sub
    return 'general'


def _risk_level_for(text_lower: str) -> str:
    for level in ('Critical', 'High', 'Medium', 'Low'):
        if any(kw in text_lower for kw in RISK_KEYWORDS[level]):
            return level
    return 'Medium'  # default


def _keyword_classify(text: str) -> dict:
    text_lower = text.lower()

    event_type = 'unknown'
    sub_category = 'general'
    best_match_count = 0

    for etype, config in KEYWORD_MAP.items():
        matches = sum(1 for kw in config['keywords'] if kw in text_lower)
        if matches > best_match_count:
            best_match_count = matches
            event_type = etype
            sub_category = _sub_category_for(etype, text_lower)

    risk_level = _risk_level_for(text_lower)

    return {
        'event_type': event_type,
        'sub_category': sub_category,
        'risk_level': risk_level,
    }
