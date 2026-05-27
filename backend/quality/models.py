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
        VERIFIED = "VERIFIED", "Verified (Closed)"

    deviation = models.ForeignKey(Deviation, on_delete=models.SET_NULL, null=True, blank=True, related_name='capas')
    capa_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.CharField(max_length=100)
    
    root_cause = models.TextField(blank=True, null=True)
    action_plan = models.TextField(blank=True, null=True)
    
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    
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