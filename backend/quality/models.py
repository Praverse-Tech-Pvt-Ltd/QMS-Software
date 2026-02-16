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
        QA_REVIEW = "QA_REVIEW", "QA Review"
        INVESTIGATION = "INVESTIGATION", "Investigation"
        CAPA_REQUIRED = "CAPA_REQUIRED", "CAPA Required"
        CLOSED = "CLOSED", "Closed"
        
    def save(self, *args, **kwargs):
        if not self.deviation_id:
            self.deviation_id = generate_qms_id(Deviation, 'deviation_id', 'DEV')
        super().save(*args, **kwargs)
    
    deviation_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.MINOR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    raised_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="raised_deviations")
    department = models.CharField(max_length=100)
    occurrence_date = models.DateField()
    
    def __str__(self):
        return f"{self.deviation_id}: {self.title}"

# --- 2. CAPA Model ---
class Capa(TimeStampedModel):
    deviation = models.ForeignKey(Deviation, on_delete=models.SET_NULL, null=True, blank=True, related_name='capas')
    root_cause = models.TextField(blank=True, null=True)
    action_plan = models.TextField(blank=True, null=True)
    class ActionType(models.TextChoices):
        CORRECTIVE = "CORRECTIVE", "Corrective Action"
        PREVENTIVE = "PREVENTIVE", "Preventive Action"

    class Status(models.TextChoices):
        PLANNING = "PLANNING", "Planning"
        PENDING = "PENDING", "Pending Implementation"
        COMPLETED = "COMPLETED", "Completed"
        VERIFIED = "VERIFIED", "Verified (Closed)"

    capa_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.CharField(max_length=100) # ✅ Added Department
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
    
# --- 3. Change Control Model ---
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
    
    capa = models.ForeignKey(Capa, on_delete=models.SET_NULL, null=True, blank=True, related_name='change_controls')

    cc_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    justification = models.TextField(help_text="Why is this change necessary?")
    change_type = models.CharField(max_length=20, choices=ChangeType.choices, default=ChangeType.STANDARD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    department = models.CharField(max_length=100)
    target_date = models.DateField(null=True, blank=True) # ✅ Added Target Date
    
    # ✅ Initiator (Already existed, ensured it stays)
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="initiated_changes")

    def save(self, *args, **kwargs):
        if not self.cc_id:
            self.cc_id = generate_qms_id(ChangeControl, 'cc_id', 'CC')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cc_id}: {self.title}"