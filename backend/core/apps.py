import os
import logging
from django.apps import AppConfig

logger = logging.getLogger('nexgen.startup')


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals
        self._check_env()
        self._log_ai_source()

    def _check_env(self):
        checks = [
            ('ANTHROPIC_API_KEY',
             'AI remark generation will use fallback text unless LOCAL_LLM_URL is set — set for production'),
            ('DEFAULT_FROM_EMAIL',
             'Email alerts (overdue complaints, expiring suppliers) will fail silently'),
        ]
        for var, msg in checks:
            if not os.environ.get(var):
                logger.warning("[NexGen QMS] CONFIG: %s not set — %s", var, msg)

    def _log_ai_source(self):
        """Phase 6: report which remark-generation source is active on startup."""
        if os.environ.get('LOCAL_LLM_URL'):
            logger.info("[NexGen QMS] AI: using local LLM at %s", os.environ['LOCAL_LLM_URL'])
        elif os.environ.get('ANTHROPIC_API_KEY'):
            logger.info("[NexGen QMS] AI: using Anthropic API")
        else:
            logger.warning("[NexGen QMS] AI: no LLM configured — remarks use template fallback") 