from django.db import models
from django.conf import settings
from simple_history.models import HistoricalRecords
from shared.models import BaseModel


class EMSamplingPlan(BaseModel):
    """Defines where, how, and how often environmental monitoring samples are taken."""
    CLASSIFICATIONS = [
        ('A', 'Grade A'),
        ('B', 'Grade B'),
        ('C', 'Grade C'),
        ('D', 'Grade D'),
    ]
    MONITORING_TYPES = [
        ('viable', 'Viable — microbial'),
        ('non_viable', 'Non-viable — particles'),
    ]

    area = models.CharField(max_length=200)  # e.g. "Filling Room A"
    classification = models.CharField(max_length=10, choices=CLASSIFICATIONS)
    monitoring_type = models.CharField(max_length=20, choices=MONITORING_TYPES)
    frequency = models.CharField(max_length=50)  # e.g. "Weekly", "Per batch"
    action_limit = models.DecimalField(max_digits=10, decimal_places=2)
    alert_limit = models.DecimalField(max_digits=10, decimal_places=2)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.area} — {self.get_monitoring_type_display()} ({self.get_classification_display()})"

    class Meta:
        ordering = ['area']


class EMResult(BaseModel):
    """A single sampling result. result_status is auto-derived against the plan's limits."""
    STATUSES = [
        ('normal', 'Normal'),
        ('alert', 'At Alert Limit'),
        ('action', 'At Action Limit — investigation required'),
    ]

    sampling_plan = models.ForeignKey(EMSamplingPlan, on_delete=models.PROTECT, related_name='results')
    sampling_date = models.DateField()
    sampled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='em_samples_taken',
    )
    result_value = models.DecimalField(max_digits=10, decimal_places=2)
    result_status = models.CharField(max_length=20, choices=STATUSES, default='normal')
    linked_deviation = models.ForeignKey(
        'quality.Deviation', on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )

    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        plan = self.sampling_plan
        if self.result_value >= plan.action_limit:
            self.result_status = 'action'
        elif self.result_value >= plan.alert_limit:
            self.result_status = 'alert'
        else:
            self.result_status = 'normal'

        needs_deviation = self.result_status == 'action' and not self.linked_deviation
        super().save(*args, **kwargs)

        if needs_deviation:
            self._create_linked_deviation()

    def _create_linked_deviation(self):
        """
        Auto-create a Deviation on action limit breach. Deviation is a legacy
        model (core.TimeStampedModel, not shared.BaseModel — no created_by field,
        uses raised_by instead) — see quality/models.py. Never blocks result entry.
        """
        try:
            from quality.models import Deviation
            plan = self.sampling_plan
            deviation = Deviation.objects.create(
                title=f'EM Action Limit Breach — {plan.area}',
                description=(
                    f'Environmental monitoring result {self.result_value} exceeded the action limit '
                    f'({plan.action_limit}) for {plan.get_monitoring_type_display()} monitoring in '
                    f'{plan.area} ({plan.get_classification_display()}) on {self.sampling_date}.'
                ),
                raised_by=self.sampled_by,
                department=plan.area,
                occurrence_date=self.sampling_date,
                risk_level='CRITICAL' if plan.classification in ('A', 'B') else 'MAJOR',
            )
            type(self).objects.filter(pk=self.pk).update(linked_deviation=deviation)
            self.linked_deviation = deviation
        except Exception:
            pass  # AI/cross-app side effect never blocks result entry

    def __str__(self):
        return f"{self.sampling_plan.area} — {self.sampling_date} ({self.result_status})"

    class Meta:
        ordering = ['-sampling_date']
