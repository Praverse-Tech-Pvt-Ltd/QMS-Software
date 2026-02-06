from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from core.utils import generate_qms_id  # Import our ID generator

class Document(TimeStampedModel):
    class DocType(models.TextChoices):
        SOP = "SOP", "Standard Operating Procedure"
        POLICY = "POL", "Policy"
        WORK_INSTRUCTION = "WI", "Work Instruction"
        FORM = "FORM", "Form"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        REVIEW = "REVIEW", "In Review"
        APPROVED = "APPROVED", "Approved"
        EFFECTIVE = "EFFECTIVE", "Effective"
        OBSOLETE = "OBSOLETE", "Obsolete"

    title = models.CharField(max_length=255)
    # Changed to editable=False so the system handles it
    document_id = models.CharField(max_length=50, unique=True, editable=False) 
    doc_type = models.CharField(max_length=10, choices=DocType.choices, default=DocType.SOP)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_documents")
    department = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # Auto-generate ID: SOP-2026-001
        if not self.document_id:
            # Use the doc_type as the prefix (e.g., "SOP", "POL", "WI")
            prefix = self.doc_type 
            self.document_id = generate_qms_id(Document, 'document_id', prefix)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.document_id}: {self.title}"

class DocumentVersion(TimeStampedModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="versions")
    version_number = models.CharField(max_length=10) # e.g., "1.0", "1.1"
    file = models.FileField(upload_to="documents/%Y/%m/")
    change_log = models.TextField(help_text="Reason for change")
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('document', 'version_number')

    def __str__(self):
        return f"{self.document.document_id} - v{self.version_number}"