from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from shared.models import BaseModel
from simple_history.models import HistoricalRecords

class TrainingPlan(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        OBSOLETE = "OBSOLETE", "Obsolete"

    title = models.CharField(max_length=255)
    description = models.TextField()
    department = models.CharField(max_length=100)
    trainer = models.CharField(max_length=100) # Or ForeignKey to User
    duration_minutes = models.PositiveIntegerField(default=60)
    
    # "SOP" or "Classroom"
    method = models.CharField(max_length=50, default="Classroom") 
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    def __str__(self):
        return self.title

class TrainingAssignment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        OVERDUE = "OVERDUE", "Overdue"

    plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name="assignments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="training_assignments")
    
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    score = models.PositiveIntegerField(null=True, blank=True)
    # AI-generated quiz: [{question, options: [str], correct_index: int}]
    quiz_questions = models.JSONField(default=list, blank=True)
    quiz_passed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.plan.title}"


class SCORMModule(BaseModel):
    """
    Phase 7 — SCORM e-learning package metadata attached to a TrainingPlan.
    Data-model/API stub only; no in-browser SCORM player this phase.
    """
    class Version(models.TextChoices):
        SCORM_12 = "1.2", "SCORM 1.2"
        SCORM_2004 = "2004", "SCORM 2004"

    training_plan = models.OneToOneField(
        TrainingPlan, on_delete=models.CASCADE, related_name="scorm_module",
        null=True, blank=True,
    )
    title = models.CharField(max_length=200)
    version = models.CharField(max_length=10, choices=Version.choices)
    package_file = models.FileField(upload_to="scorm_packages/%Y/")
    launch_url = models.CharField(max_length=500, blank=True)
    completion_threshold = models.DecimalField(max_digits=5, decimal_places=2, default=80.0)

    history = HistoricalRecords()

    def __str__(self):
        return self.title


class SCORMResult(BaseModel):
    """
    Phase 7 — a single SCORM completion/score record for a TrainingAssignment.
    """
    class CompletionStatus(models.TextChoices):
        PASSED = "passed", "Passed"
        FAILED = "failed", "Failed"
        INCOMPLETE = "incomplete", "Incomplete"
        NOT_ATTEMPTED = "not_attempted", "Not Attempted"

    scorm_module = models.ForeignKey(SCORMModule, on_delete=models.PROTECT, related_name="results")
    assignment = models.ForeignKey(TrainingAssignment, on_delete=models.CASCADE, related_name="scorm_results")
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    completion_status = models.CharField(
        max_length=20, choices=CompletionStatus.choices, default=CompletionStatus.NOT_ATTEMPTED,
    )
    raw_data = models.JSONField(default=dict)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.assignment} - {self.scorm_module.title} ({self.completion_status})"