from django.core.management.base import BaseCommand
from core.models import RetentionPolicy

DEFAULTS = [
    ('Document',              10, '21 CFR 211.68(b) — life of drug + 1 year'),
    ('CAPA',                  10, '21 CFR 211.180 — quality records 3+ years'),
    ('Deviation',             10, '21 CFR 211.192 — investigation records'),
    ('Complaint',             10, '21 CFR 211.198(b)(3) — complaint files'),
    ('AuditLog',              25, '21 CFR Part 11 — life of system'),
    ('Audit',                 10, '21 CFR 211.180'),
    ('BatchProductionRecord', 10, '21 CFR 211.188 — batch records + 1yr post expiry'),
    ('Supplier',              10, '21 CFR 211.84 — supplier qualification records'),
    ('AnalystQualification',   5, 'GMP — active + 2 years post-expiry'),
    ('InventoryLot',           5, 'Raw material records — batch + 1 year'),
    ('CalibrationRecord',      5, '21 CFR 211.68 — calibration records'),
    ('StabilityProtocol',     15, 'ICH Q1A — stability data for registration'),
]


class Command(BaseCommand):
    help = 'Seed default retention policies'

    def handle(self, *args, **options):
        for rt, yrs, basis in DEFAULTS:
            obj, created = RetentionPolicy.objects.update_or_create(
                record_type=rt,
                defaults={'retention_years': yrs, 'regulatory_basis': basis})
            self.stdout.write(f'{"Created" if created else "Updated"}: {rt}')
        self.stdout.write(self.style.SUCCESS('Done.'))
