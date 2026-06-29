"""
Algorithm C — Risk Scorer
Weighted additive scoring from questionnaire answers.
All weights are in config (NOT learned) — fully auditable for GMP.

Score 0-100:
  Low      < 25
  Medium   25-50
  High     50-75
  Critical > 75
"""

# Weight config per module
# Each key is an answer value; weight is added to total score
SCORING_CONFIG = {
    'audit': {
        'trigger': {
            'Complaint or deviation': 20,
            'Regulatory requirement': 15,
            'New supplier qualification': 10,
            'Customer request': 10,
            'Post-change verification': 10,
            'Scheduled (annual plan)': 5,
        },
        'criteria': {
            '21 CFR Part 211': 15,
            '21 CFR Part 820': 15,
            'EU GMP Annex 11': 12,
            'ICH Q10': 10,
            'ISO 13485': 10,
            'Internal SOP Compliance': 5,
            'Other': 5,
        },
    },
    'deviation': {
        'patient_impact': {
            'Yes - direct impact possible': 40,
            'Possible - needs investigation': 20,
            'No - contained': 5,
        },
        'sop_breach': {
            'Yes': 20,
            'Partially': 10,
            'No': 0,
        },
        'repeat_deviation': {
            'Yes': 25,
            'Unknown': 10,
            'No': 0,
        },
    },
    'complaint': {
        'serious_adr': {
            'Yes': 40,
            'No': 0,
        },
        'complaint_nature': {
            'Adverse drug reaction': 35,
            'Product quality defect': 25,
            'Efficacy complaint': 20,
            'Packaging / labelling issue': 10,
            'Delivery / supply issue': 5,
        },
        'repeat_complaint': {
            'Yes': 20,
            'Unknown': 5,
            'No': 0,
        },
    },
    'risk': {
        # Uses numeric values from FMEA S/O/D scales
        # RPN = S x O x D, scaled to 0-100 (max = 125)
    },
    'dms': {
        # DMS risk is low by default — documents don't need FMEA-level scoring.
        # Present so the remark generator can still request a risk context for module='dms'.
    },
    'nc': {
        'detection_stage': {
            'Customer / field': 35,
            'Final QC release testing': 20,
            'Stability testing': 15,
            'In-process check': 10,
            'Incoming material inspection': 5,
        },
        'quarantined': {
            'No': 20,
            'Yes': 0,
        },
        'defect_type': {
            'Contamination / foreign matter': 30,
            'Out-of-specification result': 25,
            'Physical defect (crack, chip, deformation)': 15,
            'Label / documentation error': 10,
            'Packaging failure': 10,
        },
    },
}

APPROVAL_CHAINS = {
    'Low': ['qa_executive'],
    'Medium': ['qa_manager'],
    'High': ['qa_manager', 'qa_head'],
    'Critical': ['qa_manager', 'qa_head', 'admin'],
}


def score_risk(module: str, answers: dict) -> dict:
    """
    Compute weighted risk score from questionnaire answers.

    Args:
        module: Module name
        answers: {question_id: answer_value} from completed questionnaire

    Returns:
        {
            'score': int (0-100),
            'level': str (Low|Medium|High|Critical),
            'approval_chain': list[str],
        }
    """
    # Special case: FMEA (risk module) uses S x O x D
    if module == 'risk':
        s = int(answers.get('q3', 1))
        o = int(answers.get('q4', 1))
        d = int(answers.get('q5', 1))
        rpn = s * o * d  # max 125
        score = min(int((rpn / 125) * 100), 100)
    else:
        config = SCORING_CONFIG.get(module, {})
        score = 0
        for question_id, answer_value in answers.items():
            question_weights = config.get(question_id, {})
            score += question_weights.get(str(answer_value), 0)
        score = min(score, 100)

    if score < 25:
        level = 'Low'
    elif score < 50:
        level = 'Medium'
    elif score < 75:
        level = 'High'
    else:
        level = 'Critical'

    return {
        'score': score,
        'level': level,
        'approval_chain': APPROVAL_CHAINS[level],
    }
