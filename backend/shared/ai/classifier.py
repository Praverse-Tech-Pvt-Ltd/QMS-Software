"""
Algorithm A — Event Classifier
Classifies a free-text quality event into event_type, sub_category, and initial risk_level.
Phase 1: rule-based keyword matching.
Phase 2: replace with scikit-learn logistic regression trained on labelled pharma events.
"""

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
    text_lower = text.lower()

    event_type = 'unknown'
    sub_category = 'general'
    best_match_count = 0

    for etype, config in KEYWORD_MAP.items():
        matches = sum(1 for kw in config['keywords'] if kw in text_lower)
        if matches > best_match_count:
            best_match_count = matches
            event_type = etype

            # Detect sub_category
            for sub, sub_kws in config['sub_categories'].items():
                if any(kw in text_lower for kw in sub_kws):
                    sub_category = sub
                    break
            else:
                sub_category = 'general'

    # Risk level from keywords
    risk_level = 'Medium'  # default
    for level in ('Critical', 'High', 'Medium', 'Low'):
        if any(kw in text_lower for kw in RISK_KEYWORDS[level]):
            risk_level = level
            break

    return {
        'event_type': event_type,
        'sub_category': sub_category,
        'risk_level': risk_level,
    }
