import datetime
from django.db import models
from django.db.models import Max
from django.conf import settings
from core.models import TimeStampedModel

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
    
    # editable=False ensures it is not shown in simple forms, but we generate it in save()
    document_id = models.CharField(max_length=50, unique=True, editable=False) 
    
    doc_type = models.CharField(max_length=10, choices=DocType.choices, default=DocType.SOP)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_documents")
    department = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # ✅ Auto-generate ID only if it doesn't exist
        if not self.document_id:
            self.document_id = self.generate_sequential_id()
        super().save(*args, **kwargs)

    def generate_sequential_id(self):
        """
        Generates ID format: TYPE-DEPT-YYYY-SEQ
        Example: SOP-QA-2026-001
        """
        current_year = datetime.date.today().year
        
        # 1. Standardize Department Codes
        # Maps full names or codes to 2-3 letter abbreviations
        dept_map = {
            'Quality Assurance': 'QA', 'QA': 'QA',
            'Quality Control': 'QC', 'QC': 'QC',
            'Production': 'PRD', 'Manufacturing': 'PRD',
            'Warehouse': 'WH', 'Logistics': 'WH',
            'Engineering': 'ENG',
            'IT': 'IT',
            'HR': 'HR'
        }
        # Default to 'GEN' if department not found
        dept_code = dept_map.get(self.department, 'GEN')
        
        # 2. Build Prefix (e.g., "SOP-QA-2026-")
        prefix = f"{self.doc_type}-{dept_code}-{current_year}-"
        
        # 3. Find Max ID in DB that starts with this prefix
        max_id_val = Document.objects.filter(
            document_id__startswith=prefix
        ).aggregate(max_id=Max('document_id'))['max_id']

        # 4. Determine Sequence
        if max_id_val:
            try:
                # Extract last 3 digits: SOP-QA-2026-005 -> 5
                sequence = int(max_id_val.split('-')[-1]) + 1
            except ValueError:
                sequence = 1
        else:
            sequence = 1

        # 5. Return Formatted ID (e.g., SOP-QA-2026-001)
        return f"{prefix}{sequence:03d}"

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