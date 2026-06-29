from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from core.utils import generate_qms_id

# --- 1. Deviation Model ---
class Deviation(TimeStampedModel):
    class RiskLevel(models.TextChoices):
        MINOR = "MINOR", "Minor"
        MAJOR = "MAJOR", "Major"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        INVESTIGATION = "INVESTIGATION", "Investigation"
        QA_REVIEW = "QA_REVIEW", "QA Review"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        CAPA_REQUIRED = "CAPA_REQUIRED", "CAPA Required"
        APPROVED = "APPROVED", "Approved"
        CLOSED = "CLOSED", "Closed"

    deviation_id = models.CharField(max_length=50, unique=True, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # New fields for investigation
    immediate_actions = models.TextField(blank=True, null=True)
    root_cause = models.TextField(blank=True, null=True)
    
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.MINOR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="raised_deviations")
    department = models.CharField(max_length=100)
    occurrence_date = models.DateField()

    def save(self, *args, **kwargs):
        if not self.deviation_id:
            self.deviation_id = generate_qms_id(Deviation, 'deviation_id', 'DEV')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.deviation_id}: {self.title}"

# --- 2. CAPA Model ---
class Capa(TimeStampedModel):
    class ActionType(models.TextChoices):
        CORRECTIVE = "CORRECTIVE", "Corrective Action"
        PREVENTIVE = "PREVENTIVE", "Preventive Action"

    class Status(models.TextChoices):
        PLANNING = "PLANNING", "Planning"
        PENDING = "PENDING", "Pending Implementation"
        IMPLEMENTATION = "IMPLEMENTATION", "Implementation"
        COMPLETED = "COMPLETED", "Completed"
        EFFECTIVENESS_PENDING = "EFFECTIVENESS_PENDING", "Effectiveness Pending"
        VERIFIED = "VERIFIED", "Verified (Closed)"

    TRANSITIONS = {
        'PLANNING': ['PENDING'],
        'PENDING': ['IMPLEMENTATION'],
        'IMPLEMENTATION': ['COMPLETED'],
        'COMPLETED': ['EFFECTIVENESS_PENDING', 'VERIFIED'],
        'EFFECTIVENESS_PENDING': ['VERIFIED'],
    }
    ESIG_REQUIRED_ACTIONS = ['VERIFIED']

    deviation = models.ForeignKey(Deviation, on_delete=models.SET_NULL, null=True, blank=True, related_name='capas')
    capa_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.CharField(max_length=100)
    
    root_cause = models.TextField(blank=True, null=True)
    action_plan = models.TextField(blank=True, null=True)
    
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PLANNING)
    
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_capas')
    due_date = models.DateField()

    def save(self, *args, **kwargs):
        if not self.capa_id:
            self.capa_id = generate_qms_id(Capa, 'capa_id', 'CAPA')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.capa_id}: {self.title}"

# --- 3. CAPA Action Model ---
class CapaAction(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        DONE = "DONE", "Done"

    capa = models.ForeignKey(Capa, on_delete=models.CASCADE, related_name='actions')
    description = models.CharField(max_length=255)
    owner = models.CharField(max_length=100)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"{self.capa.capa_id} - {self.description}"

# --- 4. Change Control Model ---
class ChangeControl(TimeStampedModel):
    class ChangeType(models.TextChoices):
        STANDARD = "STANDARD", "Standard"
        PERMANENT = "PERMANENT", "Permanent"
        TEMPORARY = "TEMPORARY", "Temporary"
        EMERGENCY = "EMERGENCY", "Emergency"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        EVALUATION = "EVALUATION", "Impact Evaluation"
        APPROVAL = "APPROVAL", "Pending Approval"
        IMPLEMENTATION = "IMPLEMENTATION", "Implementation"
        CLOSED = "CLOSED", "Closed"

    TRANSITIONS = {
        'DRAFT': ['EVALUATION'],
        'EVALUATION': ['APPROVAL'],
        'APPROVAL': ['IMPLEMENTATION'],
        'IMPLEMENTATION': ['CLOSED'],
    }
    ESIG_REQUIRED_ACTIONS = ['APPROVAL', 'CLOSED']

    impact_data = models.JSONField(default=dict, blank=True)
    risk_level = models.CharField(max_length=20, default="Medium")
    capa = models.ForeignKey(Capa, on_delete=models.SET_NULL, null=True, blank=True, related_name='change_controls')
    cc_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    justification = models.TextField(help_text="Why is this change necessary?")
    change_type = models.CharField(max_length=20, choices=ChangeType.choices, default=ChangeType.STANDARD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    department = models.CharField(max_length=100)
    target_date = models.DateField(null=True, blank=True)
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="initiated_changes")

    def save(self, *args, **kwargs):
        if not self.cc_id:
            self.cc_id = generate_qms_id(ChangeControl, 'cc_id', 'CC')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cc_id}: {self.title}"


# --- 5. CAPA Effectiveness Check ---
class EffectivenessCheck(TimeStampedModel):
    RESULTS = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('pending', 'Pending'),
    ]

    capa = models.OneToOneField(Capa, on_delete=models.CASCADE, related_name='effectiveness_check')
    criteria = models.TextField(help_text='What defines a successful CAPA?')
    due_date = models.DateField()
    result = models.CharField(max_length=10, choices=RESULTS, default='pending')
    evidence_file = models.FileField(upload_to='effectiveness/', null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='effectiveness_reviews',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Effectiveness check for {self.capa.capa_id}: {self.result}"


# --- 6. OOS Investigation ---
class OOSInvestigation(TimeStampedModel):
    PHASES = [
        ('phase1', 'Phase 1 — Lab Investigation'),
        ('phase2', 'Phase 2 — Full Investigation'),
        ('invalidated', 'Invalidated'),
        ('confirmed_oos', 'Confirmed OOS'),
    ]
    TRANSITIONS = {
        'phase1': ['phase2', 'invalidated'],
        'phase2': ['confirmed_oos', 'invalidated'],
    }
    ESIG_REQUIRED_ACTIONS = ['invalidated', 'confirmed_oos']

    oos_number = models.CharField(max_length=30, unique=True, blank=True)
    product = models.CharField(max_length=200)
    batch_lot = models.CharField(max_length=100)
    test_name = models.CharField(max_length=200)
    specification = models.CharField(max_length=200, blank=True)
    result_obtained = models.CharField(max_length=100)
    phase = models.CharField(max_length=20, choices=PHASES, default='phase1')
    assignable_cause = models.BooleanField(null=True, blank=True)
    invalidation_reason = models.TextField(blank=True)
    linked_capa = models.ForeignKey(
        Capa, on_delete=models.SET_NULL, null=True, blank=True, related_name='oos_investigations'
    )
    linked_test_result = models.ForeignKey(
        'laboratory.TestResult',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='oos_investigations',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_oos',
    )
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='modified_oos',
    )

    def save(self, *args, **kwargs):
        if not self.oos_number:
            self.oos_number = generate_qms_id(OOSInvestigation, 'oos_number', 'OOS')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.oos_number} — {self.product} ({self.test_name})"


class OOSPhase1(TimeStampedModel):
    CONCLUSIONS = [
        ('assignable_cause_found', 'Assignable Cause Found — Invalidate'),
        ('proceed_to_phase2', 'No Assignable Cause — Proceed to Phase 2'),
    ]

    investigation = models.OneToOneField(OOSInvestigation, on_delete=models.CASCADE, related_name='phase1')
    instrument_check = models.BooleanField(default=False, help_text='Instrument calibration verified?')
    analyst_retest_result = models.CharField(max_length=100, blank=True)
    calculation_error_found = models.BooleanField(default=False)
    additional_notes = models.TextField(blank=True)
    conclusion = models.CharField(max_length=30, choices=CONCLUSIONS, blank=True)


class OOSPhase2(TimeStampedModel):
    CONCLUSIONS = [
        ('confirmed_oos', 'Confirmed OOS'),
        ('invalidated', 'Result Invalidated'),
    ]

    investigation = models.OneToOneField(OOSInvestigation, on_delete=models.CASCADE, related_name='phase2')
    resampling_conducted = models.BooleanField(default=False)
    additional_results = models.JSONField(default=list)
    conclusion = models.CharField(max_length=20, choices=CONCLUSIONS, blank=True)
    qa_review_notes = models.TextField(blank=True)


class OOTConfig(models.Model):
    """
    Out-of-Trend configuration per product/test.
    Used to flag OOT before results hit OOS threshold.
    """
    METHODS = [
        ('three_sigma', '3-Sigma Rule'),
        ('custom_range', 'Custom Range'),
    ]

    product = models.CharField(max_length=200)
    test_name = models.CharField(max_length=200)
    method = models.CharField(max_length=20, choices=METHODS, default='three_sigma')
    lower_limit = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    upper_limit = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'test_name')

    def __str__(self):
        return f"OOT config: {self.product} — {self.test_name}"