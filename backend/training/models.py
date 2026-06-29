from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

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