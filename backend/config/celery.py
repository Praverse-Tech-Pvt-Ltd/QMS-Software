import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('qms')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'scrape-fda-daily': {
        'task': 'knowledge.tasks.scrape_fda_enforcements',
        'schedule': crontab(hour=2, minute=0),
    },
    'embed-fda-observations': {
        'task': 'knowledge.tasks.embed_unembedded_observations',
        'schedule': crontab(hour=3, minute=0),
    },
    'check-overdue-complaints': {
        'task': 'complaints.tasks.alert_overdue',
        'schedule': crontab(hour=8, minute=0),
    },
    'check-expiring-suppliers': {
        'task': 'suppliers.tasks.alert_expiring',
        'schedule': crontab(hour=8, minute=30),
    },
    'check-overdue-actions': {
        'task': 'quality.tasks.alert_overdue_actions',
        'schedule': crontab(hour=8, minute=0),
    },
    'check-overdue-training': {
        'task': 'training.tasks.alert_overdue',
        'schedule': crontab(hour=9, minute=0),
    },
    'alert-overdue-action-items': {
        'task': 'shared.tasks.alert_overdue_action_items',
        'schedule': crontab(hour=8, minute=30),
    },
}
