from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from core.utils import generate_qms_id

# --- 1. Deviation Model (Existing) ---
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
        # Only generate ID if it doesn't exist yet (Creation time)
        if not self.deviation_id:
            self.deviation_id = generate_qms_id(Deviation, 'deviation_id', 'DEV')
        super().save(*args, **kwargs)
    
    # Core Fields
    deviation_id = models.CharField(max_length=50, unique=True) # e.g., DEV-2026-001
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Classification
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.MINOR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    # Assignment
    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name="raised_deviations"
    )
    department = models.CharField(max_length=100)
    
    # Dates
    occurrence_date = models.DateField()
    
    def __str__(self):
        return f"{self.deviation_id}: {self.title}"

# --- 2. CAPA Model (New) ---
class Capa(TimeStampedModel):
    # Link to Deviation (Optional: A CAPA might be standalone)
    deviation = models.ForeignKey(
        Deviation, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='capas'
    )

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
    
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    
    # Who is responsible for fixing this?
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='assigned_capas'
    )
    due_date = models.DateField()

    def save(self, *args, **kwargs):
        # reuse our tool to generate CAPA-2026-001
        if not self.capa_id:
            self.capa_id = generate_qms_id(Capa, 'capa_id', 'CAPA')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.capa_id}: {self.title}"
    
class ChangeControl(TimeStampedModel):
    class ChangeType(models.TextChoices):
        PERMANENT = "PERMANENT", "Permanent"
        TEMPORARY = "TEMPORARY", "Temporary"
        EMERGENCY = "EMERGENCY", "Emergency"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        EVALUATION = "EVALUATION", "Impact Evaluation"
        APPROVAL = "APPROVAL", "Pending Approval"
        IMPLEMENTATION = "IMPLEMENTATION", "Implementation"
        CLOSED = "CLOSED", "Closed"
    
    # Link to CAPA (Optional)
    capa = models.ForeignKey(
        Capa, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='change_controls'
    )

    cc_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    justification = models.TextField(help_text="Why is this change necessary?")
    
    change_type = models.CharField(max_length=20, choices=ChangeType.choices, default=ChangeType.PERMANENT)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    department = models.CharField(max_length=100)
    
    # Who started this change?
    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name="initiated_changes"
    )

    def save(self, *args, **kwargs):
        # Auto-generate ID: CC-2026-001
        if not self.cc_id:
            from core.utils import generate_qms_id
            self.cc_id = generate_qms_id(ChangeControl, 'cc_id', 'CC')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cc_id}: {self.title}"