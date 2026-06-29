from django.contrib.auth.models import AbstractUser
from django.db import models


class Site(models.Model):
    """
    Physical manufacturing / office site.
    Referenced by BaseModel for multi-site traceability.
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    country = models.CharField(max_length=100, default='India')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} — {self.name}"


class User(AbstractUser):
    class Role(models.TextChoices):
        # Value (DB/API)    # Label (Django Admin)
        ADMIN = "Admin", "Admin"
        QA_HEAD = "QA Head", "QA Head (HOD)"
        QA_MANAGER = "QA Manager", "QA Manager"
        QA_EXECUTIVE = "QA Executive", "QA Executive"
        QA = "QA", "Quality Assurance"          # legacy — maps to QA Executive
        QC = "QC", "Quality Control"
        PRODUCTION = "Production", "Production"
        WAREHOUSE = "Warehouse", "Warehouse"
        VIEWER = "Viewer", "Viewer"

    role = models.CharField(
        max_length=50, 
        choices=Role.choices, 
        default=Role.VIEWER
    )
    
    department = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=20, unique=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"