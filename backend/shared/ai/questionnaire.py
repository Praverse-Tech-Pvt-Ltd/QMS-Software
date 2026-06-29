"""
Algorithm B — Adaptive Questionnaire Engine
Deterministic, auditable decision tree. NOT ML.
Reads JSON question trees from question_trees/ directory.
"""
import json
from pathlib import Path

TREES_DIR = Path(__file__).parent / 'question_trees'

_cache: dict = {}


def _load_tree(module: str) -> dict:
    if module not in _cache:
        tree_path = TREES_DIR / f'{module}.json'
        if not tree_path.exists():
            raise ValueError(f"No question tree found for module '{module}'")
        with open(tree_path, 'r', encoding='utf-8') as f:
            _cache[module] = json.load(f)
    return _cache[module]


def _build_index(tree: dict) -> dict:
    return {q['id']: q for q in tree['questions']}


def _answers_match(actual, expected):
    """
    Compare a collected answer against a branch's expected value safely,
    regardless of answer type. multi_select answers are lists, which are
    unhashable and crash a plain `expected in branches_dict` lookup.
    """
    if isinstance(actual, list):
        return expected in actual
    return actual == expected


def get_next_questions(module: str, event_type: str, answers: dict) -> dict:
    """
    Return the next question(s) in the adaptive questionnaire.

    Args:
        module: Module name (audit, deviation, complaint, risk, nc)
        event_type: Classified event type from Algorithm A
        answers: Dict of {question_id: answer_value} already collected

    Returns:
        {
            'next_questions': [question_dict, ...],  # empty list if complete
            'complete': bool,
            'prefill': dict,  # pre-filled form values inferred from answers
        }
    """
    tree = _load_tree(module)
    index = _build_index(tree)

    answered_ids = set(answers.keys())

    # Find the first unanswered question following the answered path
    # Start from q1 and walk the chain
    current_id = tree['questions'][0]['id']
    next_id = current_id

    while next_id:
        if next_id not in answered_ids:
            # This is the next unanswered question
            question = index[next_id]
            return {
                'next_questions': [question],
                'complete': False,
                'prefill': _build_prefill(answers),
            }

        # Follow branch if answer matches a branch condition
        question = index[next_id]
        answer_value = answers.get(next_id)
        branches = question.get('branches', {})

        matched_branch_id = None
        for expected_value, branch_id in branches.items():
            if _answers_match(answer_value, expected_value):
                matched_branch_id = branch_id
                break

        if matched_branch_id is not None:
            if matched_branch_id not in answered_ids:
                return {
                    'next_questions': [index[matched_branch_id]],
                    'complete': False,
                    'prefill': _build_prefill(answers),
                }
            # Branch answered — continue to default next
            next_id = question.get('next')
        else:
            next_id = question.get('next')

    # All questions answered
    return {
        'next_questions': [],
        'complete': True,
        'prefill': _build_prefill(answers),
    }


def _build_prefill(answers: dict) -> dict:
    """
    Build form pre-fill dict from collected answers.
    Maps question field names to answer values.
    """
    # answers is {question_id: answer_value}
    # We don't have the tree here so we just return as-is;
    # callers can match against question field names
    return {f'ai_{k}': v for k, v in answers.items()}
