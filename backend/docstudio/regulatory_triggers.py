"""
Regulatory-trigger rules engine (DRAFT ruleset - pending expert review).

Data-driven: each rule is a plain dict so Regulatory Affairs / NexGen can edit
and version it without touching code. Output is ALWAYS "possible trigger -
Regulatory Affairs to confirm"; the engine never decides a filing category.

change facts (all optional booleans / strings), e.g.:
  change_type: 'equipment' | 'site' | 'process' | 'specification' | 'supplier' |
               'batch_size' | 'packaging' | 'document' | 'facility' | 'software'
  affects_registered_process, equipment_different_principle, site_change,
  spec_tightened, spec_loosened, ksm_or_api_supplier_change,
  batch_size_change_over_10x, primary_packaging_change,
  affects_registered_stability, uses_dmf (API under a DMF/CEP)
"""

RULESET_STATUS = {
    'version': '0.1-draft',
    'expert_reviewed': False,
    'note': ('Starter rules for triage only. Categories vary by market and product; '
             'Regulatory Affairs must confirm against current regional guidance.'),
}

RULES = [
    {
        'id': 'RT-001', 'name': 'Manufacturing site change',
        'when': {'site_change': True},
        'possible': ['FDA: prior approval supplement (PAS) typically expected for a new site',
                     'EU: Type II variation typically expected',
                     'DMF/CEP holder: notify / amend'],
        'reference': 'FDA SUPAC / Changes to an Approved NDA or ANDA guidance; EU Variations Regulation',
        'risk': 'high',
    },
    {
        'id': 'RT-002', 'name': 'Equipment change with different operating principle',
        'when': {'change_type': 'equipment', 'equipment_different_principle': True, 'affects_registered_process': True},
        'possible': ['FDA: PAS or CBE-30 depending on process impact',
                     'EU: Type IB or Type II depending on process impact'],
        'reference': 'FDA SUPAC-IR/MR; EU Variations classification guideline',
        'risk': 'high',
    },
    {
        'id': 'RT-003', 'name': 'Like-for-like equipment replacement (same design and principle)',
        'when': {'change_type': 'equipment', 'equipment_different_principle': False, 'affects_registered_process': True},
        'possible': ['Often annual report / no prior notification - confirm'],
        'reference': 'FDA SUPAC guidance',
        'risk': 'low',
    },
    {
        'id': 'RT-004', 'name': 'Specification tightened',
        'when': {'spec_tightened': True},
        'possible': ['FDA: CBE-0 / annual report depending on change', 'EU: Type IB or IA'],
        'reference': 'FDA Changes to an Approved NDA/ANDA; EU Variations classification guideline',
        'risk': 'medium',
    },
    {
        'id': 'RT-005', 'name': 'Specification loosened or test removed',
        'when': {'spec_loosened': True},
        'possible': ['FDA: PAS typically expected', 'EU: Type II variation typically expected'],
        'reference': 'FDA Changes to an Approved NDA/ANDA; EU Variations classification guideline',
        'risk': 'high',
    },
    {
        'id': 'RT-006', 'name': 'API / KSM supplier change',
        'when': {'ksm_or_api_supplier_change': True},
        'possible': ['Update of DMF/CEP reference in the dossier', 'Possible variation depending on route/quality impact',
                     'Supplier qualification and audit prior to use'],
        'reference': 'ICH Q7; EDQM CEP procedure; regional variation guidance',
        'risk': 'high',
    },
    {
        'id': 'RT-007', 'name': 'Batch size change beyond registered range',
        'when': {'batch_size_change_over_10x': True},
        'possible': ['FDA: CBE-30 / PAS depending on scale-up validation', 'EU: Type IB / II'],
        'reference': 'FDA SUPAC; EU Variations classification guideline',
        'risk': 'medium',
    },
    {
        'id': 'RT-008', 'name': 'Primary packaging change',
        'when': {'primary_packaging_change': True},
        'possible': ['Stability data likely required', 'FDA: CBE-30 / PAS; EU: Type IB / II depending on barrier properties'],
        'reference': 'FDA container-closure guidance; ICH Q1A(R2)',
        'risk': 'medium',
    },
    {
        'id': 'RT-009', 'name': 'API manufactured under a DMF / CEP - any process or site change',
        'when': {'uses_dmf': True, 'affects_registered_process': True},
        'possible': ['DMF amendment / annual report to the DMF', 'Notify customers (letter of authorisation holders)',
                     'CEP revision / notification if CEP is held'],
        'reference': 'FDA DMF guidance; EDQM CEP policy',
        'risk': 'high',
    },
    {
        'id': 'RT-010', 'name': 'Registered stability study affected',
        'when': {'affects_registered_stability': True},
        'possible': ['Commitment batches / bracketing review', 'Possible variation if conditions or protocol change'],
        'reference': 'ICH Q1A(R2), Q1E',
        'risk': 'medium',
    },
]


def evaluate(facts):
    """Return {'status': RULESET_STATUS, 'triggers': [...], 'confirm_with': 'Regulatory Affairs'}."""
    facts = facts or {}
    hits = []
    for rule in RULES:
        if all(facts.get(k) == v for k, v in rule['when'].items()):
            hits.append({
                'id': rule['id'], 'name': rule['name'], 'possible': rule['possible'],
                'reference': rule['reference'], 'risk': rule['risk'],
                'disposition': 'POSSIBLE TRIGGER - Regulatory Affairs to confirm',
            })
    order = {'high': 0, 'medium': 1, 'low': 2}
    hits.sort(key=lambda h: order[h['risk']])
    return {'status': RULESET_STATUS, 'triggers': hits, 'confirm_with': 'Regulatory Affairs'}
