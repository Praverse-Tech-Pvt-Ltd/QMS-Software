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

    def _check_env(self):
        checks = [
            ('ANTHROPIC_API_KEY',
             'AI remark generation will use fallback text — set for production'),
            ('OPENAI_API_KEY',
             'SOP embedding and FDA semantic search are disabled — set for production'),
            ('DEFAULT_FROM_EMAIL',
             'Email alerts (overdue complaints, expiring suppliers) will fail silently'),
        ]
        for var, msg in checks:
            if not os.environ.get(var):
                logger.warning("[NexGen QMS] CONFIG: %s not set — %s", var, msg) 