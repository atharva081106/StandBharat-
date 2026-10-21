from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_default_queue="default",
    task_queues={
        "high_priority": {"exchange": "high_priority", "routing_key": "high.#"},
        "default": {"exchange": "default", "routing_key": "default.#"},
        "background_batch": {"exchange": "background_batch", "routing_key": "batch.#"},
    },
    task_routes={
        "app.worker.sync_integration": {"queue": "high_priority"},
        "app.worker.execute_agent_task": {"queue": "high_priority"},
        "app.publishing.tasks.*": {"queue": "high_priority"},
        "app.worker.sync_all_active_integrations": {"queue": "background_batch"},
        "app.backup.tasks.execute_scheduled_backup": {"queue": "background_batch"},
        "recover_stale_publications": {"queue": "background_batch"},
        "app.worker.analyze_performance_loop": {"queue": "background_batch"},
        "app.worker.execute_*": {"queue": "default"},
        "orchestrator_tick": {"queue": "default"},
    },
    include=[
        "app.orchestrator.scheduler",
        "app.worker",
        "app.publishing.tasks",
        "app.workers.celery_worker",
        "app.backup.tasks"
    ],
    # Redis Hardening & Reliability Configurations
    broker_connection_retry_on_startup=False,
    broker_pool_limit=10,
    broker_connection_max_retries=1,
    broker_connection_timeout=2.0,
    redis_socket_keepalive=True,
    redis_socket_timeout=2.0,
    redis_retry_on_timeout=False,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_retry_delay=60,
    task_max_retries=3,
)
import sys
if settings.REDIS_URL.endswith("test") or settings.ENVIRONMENT.lower() == "development" or "pytest" in sys.modules:
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True

from celery.schedules import crontab
celery_app.conf.beat_schedule = {
    'orchestrator-tick-every-15-minutes': {
        'task': 'orchestrator_tick',
        'schedule': crontab(minute='*/15'),
    },
    'sync-active-integrations-every-6-hours': {
        'task': 'app.worker.sync_all_active_integrations',
        'schedule': crontab(minute='0', hour='*/6'),
    },
    'recover-stale-publications-every-30-minutes': {
        'task': 'recover_stale_publications',
        'schedule': crontab(minute='*/30'),
    },
    'automated-postgres-backup-daily': {
        'task': 'app.backup.tasks.execute_scheduled_backup',
        'schedule': crontab(hour='2', minute='0'),
    },
}

# Auto-discover tasks in our modules
celery_app.autodiscover_tasks([
    "app.orchestrator.scheduler",
    "app.worker",
    "app.publishing",
    "app.workers.celery_worker",
    "app.backup"
])
