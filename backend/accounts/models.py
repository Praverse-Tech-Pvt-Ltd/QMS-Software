from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        # Value (DB/API)    # Label (Django Admin)
        ADMIN = "Admin", "Admin"
        QA = "QA", "Quality Assurance"
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