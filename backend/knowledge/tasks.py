"""
Celery tasks for knowledge base — FDA enforcement scraping and embedding backfill.
"""
import json
import logging
import os
import urllib.request

from celery import shared_task

from .models import FDA483Observation

logger = logging.getLogger(__name__)


@shared_task(name='knowledge.tasks.scrape_fda_enforcements', bind=True, max_retries=3, default_retry_delay=300)
def scrape_fda_enforcements(self):
    """
    Pull recent drug enforcement records from openFDA (free, no auth required).
    Runs daily at 02:00 UTC.

    Returns:
        {'created': N, 'total_fetched': M}
    """
    url = 'https://api.fda.gov/drug/enforcement.json?limit=100&skip=0'
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read())
    except Exception as exc:
        logger.error("FDA scraper network error: %s", exc)
        try:
            raise self.retry(exc=exc)
        except AttributeError:
            # self.retry only works inside a real Celery task context (bind=True with a broker).
            # When called directly (e.g. from a shell/test), surface the error instead of looping.
            return {'error': str(exc), 'created': 0, 'total_fetched': 0}

    results = data.get('results', [])
    created = 0

    for item in results:
        reason = (item.get('reason_for_recall') or '').strip()
        if not reason:
            continue

        recall_number = item.get('recall_number', '')
        source_url = (
            'https://www.accessdata.fda.gov/scripts/enforcement/enforce_rpt-Product-Tabs.cfm'
            f'?action=select&recall_number={recall_number}'
        ) if recall_number else ''

        if source_url and FDA483Observation.objects.filter(source_url=source_url).exists():
            continue

        year = None
        raw_date = item.get('recall_initiation_date', '')
        if raw_date and len(raw_date) >= 4:
            try:
                year = int(raw_date[:4])
            except ValueError:
                pass

        FDA483Observation.objects.create(
            observation_text=reason[:2000],
            cfr_section='',
            product_category=(item.get('product_type') or '').strip(),
            year=year,
            outcome='483',
            source_url=source_url,
        )
        created += 1

    logger.info("FDA scraper: %s new records created from %s fetched", created, len(results))
    return {'created': created, 'total_fetched': len(results)}


@shared_task(name='knowledge.tasks.embed_unembedded_observations')
def embed_unembedded_observations():
    """
    Embed FDA483Observation records that have no embedding yet.
    Runs at 03:00 UTC (1 hour after scrape).
    Requires OPENAI_API_KEY — degrades gracefully (never raises) if not set.

    Note: the model's pgvector `embedding` column is raw SQL only (not an ORM field — see
    knowledge/migrations/0002_add_pgvector.py), so this writes to `embedding_json` instead,
    matching how the rest of this app currently reads/writes embeddings.
    """
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        logger.warning("OPENAI_API_KEY not configured — skipping embedding task")
        return {'skipped': True, 'reason': 'OPENAI_API_KEY not set'}

    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
    except ImportError:
        logger.error("openai package not installed")
        return {'skipped': True, 'reason': 'openai not installed'}

    unembedded = list(
        FDA483Observation.objects.filter(embedding_json='').values_list('id', flat=True)[:50]
    )
    if not unembedded:
        return {'embedded': 0, 'message': 'Nothing to embed'}

    embedded = 0
    for obs_id in unembedded:
        try:
            obs = FDA483Observation.objects.get(id=obs_id)
            response = client.embeddings.create(
                model='text-embedding-3-small',
                input=obs.observation_text[:2000],
            )
            obs.embedding_json = json.dumps(response.data[0].embedding)
            obs.save(update_fields=['embedding_json'])
            embedded += 1
        except Exception as exc:
            logger.error("Embedding failed for FDA483Observation %s: %s", obs_id, exc)
            continue

    return {'embedded': embedded, 'total_queued': len(unembedded)}
