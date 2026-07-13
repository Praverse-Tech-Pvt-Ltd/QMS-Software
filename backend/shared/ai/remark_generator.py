"""
Algorithm D — Remark Generator
Generates a GMP-compliant remark draft for approvers.

Phase 1: Stub — returns a structured placeholder based on context.
Phase 3: Replace with real Claude API (claude-sonnet-4-6) call.
Phase 6: Priority chain — LOCAL_LLM_URL (self-hosted, OpenAI-compatible) takes
precedence over ANTHROPIC_API_KEY, which takes precedence over the template stub.
Never blocks: any failure at one tier falls through to the next.
"""
import logging
import os

logger = logging.getLogger('nexgen.ai')

LOCAL_LLM_URL = os.environ.get('LOCAL_LLM_URL', '')
LOCAL_LLM_MODEL = os.environ.get('LOCAL_LLM_MODEL', 'local-model')
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

# Used by generate_quiz_from_sop(), which only supports the Anthropic path today —
# kept scoped to ANTHROPIC_KEY so quiz generation's behavior is unaffected by
# LOCAL_LLM_URL being set (see generate_quiz_from_sop docstring).
STUB_MODE = not bool(ANTHROPIC_KEY)

ROLE_CONTEXT = {
    'qa_executive': 'QA Executive reviewing for completeness and initial compliance',
    'qa_manager': 'QA Manager assessing risk and regulatory alignment',
    'qa_head': 'Head of QA providing final GMP-qualified review and sign-off',
    'qa': 'Quality Assurance reviewer',
    'admin': 'System Administrator with full authority',
    'qc': 'Quality Control Analyst reviewing analytical data',
    'production': 'Production Supervisor reviewing process impact',
    'document_reviewer': 'QA Document Reviewer confirming content, version, and GMP compliance',
    'document_approver': (
        'Document Approver confirming the document meets requirements and is fit '
        'for purpose per 21 CFR 211.68 and the document management SOP'
    ),
    'qc_analyst': (
        'QC Analyst reviewing a laboratory test result, describing the result against '
        'specification and whether an OOS investigation is warranted per 21 CFR 211.192'
    ),
    'batch_release_qa': (
        'QA professional authorizing batch release, confirming all tests passed and '
        'specifications are met per 21 CFR 211.22 and the batch release SOP'
    ),
    'batch_rejection_qa': (
        'QA professional rejecting a batch, citing the specific test failure(s) and '
        'confirming the batch is quarantined pending disposition per 21 CFR 211.192'
    ),
    'production_supervisor': (
        'Production Supervisor documenting a batch record deviation — the actual value '
        'obtained versus the expected range, and the immediate action taken'
    ),
    'batch_release_production': (
        'Production reviewer confirming all batch record steps were completed and any '
        'deviations documented and linked, ready for QA release per 21 CFR 211.188'
    ),
}

MODULE_SOP_MAP = {
    'audit': ('SOP-QA-001', 'Internal Audit Procedure'),
    'capa': ('SOP-QA-002', 'CAPA Management Procedure'),
    'complaint': ('SOP-QA-003', 'Complaint Handling Procedure'),
    'deviation': ('SOP-QA-004', 'Deviation Management Procedure'),
    'nonconformance': ('SOP-QA-005', 'Nonconformance Management Procedure'),
    'risk': ('SOP-QA-006', 'Risk Management Procedure'),
    'suppliers': ('SOP-QA-007', 'Supplier Qualification Procedure'),
    'oos': ('SOP-QA-008', 'OOS Investigation Procedure'),
    'change_control': ('SOP-QA-009', 'Change Control Procedure'),
    'dms': ('SOP-QA-010', 'Document Management Procedure'),
    'laboratory': ('SOP-QC-001', 'Laboratory Testing and Batch Release Procedure'),
    'batch_records': ('SOP-PRD-001', 'Batch Production Record Procedure'),
    'logbook': ('SOP-QA-011', 'Electronic Logbook Procedure'),
    'stability': ('SOP-QC-002', 'Stability Study Procedure'),
    'recall': ('SOP-QA-012', 'Product Recall Procedure'),
}


def generate_remark(
    module: str,
    record_id: str,
    approver_role: str,
    stage: str,
    risk_level: str = 'Medium',
    summary: str = '',
    sop_chunks: list | None = None,
    fda_risk_flags: list | None = None,
) -> dict:
    """
    Generate an AI remark draft for an approver.

    Returns:
        {
            'remark_draft': str,
            'sop_citations': list[str],
            'risk_flags': list[str],
        }
    """
    sop_ref, sop_name = MODULE_SOP_MAP.get(module, ('SOP-QA-000', 'QMS General Procedure'))
    role_context = ROLE_CONTEXT.get(approver_role, 'Reviewer')
    sop_chunks = sop_chunks or []
    fda_risk_flags = fda_risk_flags or []

    if LOCAL_LLM_URL:
        result = _local_remark(module, record_id, approver_role, stage, risk_level, summary, sop_ref, sop_name, role_context, sop_chunks, fda_risk_flags)
        if result is not None:
            return result
        # Local model unavailable/failed — fall through to Anthropic, then stub.

    if ANTHROPIC_KEY:
        return _claude_remark(module, record_id, approver_role, stage, risk_level, summary, sop_ref, sop_name, role_context, sop_chunks, fda_risk_flags)

    return _stub_remark(module, record_id, approver_role, stage, risk_level, sop_ref, sop_name, role_context, fda_risk_flags)


def _stub_remark(module, record_id, approver_role, stage, risk_level, sop_ref, sop_name, role_context, fda_risk_flags):
    risk_note = ''
    if risk_level in ('High', 'Critical'):
        risk_note = f' Given the {risk_level.lower()} risk classification, enhanced scrutiny and documented justification are required per ICH Q9 Section 5.'

    remark = (
        f'I, as {role_context}, have reviewed {module.replace("_", " ").title()} record {record_id} '
        f'at the {stage} stage. The record has been assessed in accordance with {sop_name} ({sop_ref}).{risk_note} '
        f'All required fields are complete and the documentation meets GMP requirements per 21 CFR Part 211. '
        f'I confirm my review and approve this record to proceed to the next stage.'
    )

    risk_flags = []
    if risk_level == 'Critical':
        risk_flags.append('FDA 483 Warning: Critical-risk events of this type have historically led to Warning Letters. Ensure root cause investigation is thorough.')
    if fda_risk_flags:
        risk_flags.extend(fda_risk_flags)

    return {
        'remark_draft': remark,
        'sop_citations': [f'{sop_ref} — {sop_name}'],
        'risk_flags': risk_flags,
    }


def _build_prompts(module, record_id, stage, risk_level, summary, role_context, sop_chunks, fda_risk_flags):
    sop_context = '\n'.join(f'[SOP Chunk]: {chunk}' for chunk in sop_chunks[:3]) if sop_chunks else 'No SOP chunks available.'
    fda_context = '\n'.join(f'[FDA Risk]: {flag}' for flag in fda_risk_flags) if fda_risk_flags else ''

    system_prompt = (
        f'You are a GMP compliance expert writing an approval remark for a pharmaceutical QMS. '
        f'You are acting as: {role_context}. '
        f'Write a 3-5 sentence remark that: '
        f'(1) acknowledges the specific record and stage reviewed, '
        f'(2) cites the relevant SOP by name and number, '
        f'(3) comments on risk level ({risk_level}), '
        f'(4) states the approval decision clearly. '
        f'Do NOT be generic. Use precise GMP language. Do NOT make up SOPs not provided. '
        f'If FDA risk flags are present, acknowledge them in the remark.'
    )

    user_prompt = (
        f'Module: {module}\nRecord ID: {record_id}\nStage: {stage}\nRisk Level: {risk_level}\n'
        f'Summary: {summary}\n\nRelevant SOP:\n{sop_context}\n\n{fda_context}'
    )

    return system_prompt, user_prompt


def _local_remark(module, record_id, approver_role, stage, risk_level, summary, sop_ref, sop_name, role_context, sop_chunks, fda_risk_flags):
    """
    Calls a self-hosted, OpenAI-compatible LLM server (vLLM / llama.cpp) at LOCAL_LLM_URL.
    Returns None on any failure so the caller falls through to Anthropic / stub — never raises.
    """
    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("openai package not installed — cannot reach LOCAL_LLM_URL")
        return None

    system_prompt, user_prompt = _build_prompts(
        module, record_id, stage, risk_level, summary, role_context, sop_chunks, fda_risk_flags,
    )

    try:
        client = OpenAI(base_url=f'{LOCAL_LLM_URL}/v1', api_key='local')
        response = client.chat.completions.create(
            model=LOCAL_LLM_MODEL,
            max_tokens=400,
            temperature=0.3,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
        )
        remark_text = response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("Local LLM at %s failed: %s", LOCAL_LLM_URL, exc)
        return None

    return {
        'remark_draft': remark_text,
        'sop_citations': [f'{sop_ref} — {sop_name}'],
        'risk_flags': fda_risk_flags,
    }


def _claude_remark(module, record_id, approver_role, stage, risk_level, summary, sop_ref, sop_name, role_context, sop_chunks, fda_risk_flags):
    try:
        import anthropic
    except ImportError:
        return _stub_remark(module, record_id, approver_role, stage, risk_level, sop_ref, sop_name, role_context, fda_risk_flags)

    system_prompt, user_prompt = _build_prompts(
        module, record_id, stage, risk_level, summary, role_context, sop_chunks, fda_risk_flags,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    message = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=400,
        system=system_prompt,
        messages=[{'role': 'user', 'content': user_prompt}],
    )

    remark_text = message.content[0].text

    return {
        'remark_draft': remark_text,
        'sop_citations': [f'{sop_ref} — {sop_name}'],
        'risk_flags': fda_risk_flags,
    }


def generate_quiz_from_sop(sop_name: str, sop_chunks: list[str]) -> list[dict]:
    """
    Generate 5 multiple-choice quiz questions from SOP content, for training
    comprehension checks. Reuses the same Claude client/availability pattern as
    generate_remark() — never blocks training: returns [] if AI is unavailable
    or the response can't be parsed.

    Returns:
        list of {question: str, options: list[str], correct_index: int}
    """
    if STUB_MODE or not sop_chunks:
        return []

    try:
        import anthropic
    except ImportError:
        return []

    context = '\n\n'.join(sop_chunks[:3])  # top 3 chunks
    prompt = f"""Based on this SOP content from {sop_name}, generate exactly 5
multiple-choice questions to verify comprehension.

SOP CONTENT:
{context}

Return ONLY valid JSON, no other text:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_index": 0
    }}
  ]
}}"""

    try:
        client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
        response = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=1000,
            messages=[{'role': 'user', 'content': prompt}],
        )
        import json
        text = response.content[0].text.strip()
        # Strip markdown fences if present
        if text.startswith('```'):
            text = text.split('\n', 1)[1]
            text = text.rsplit('```', 1)[0]
        data = json.loads(text)
        return data.get('questions', [])
    except Exception:
        # Never block training — return empty if AI fails for any reason.
        return []
