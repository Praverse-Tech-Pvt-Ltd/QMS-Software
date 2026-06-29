from django.db import models
from django.conf import settings


class FDA483Observation(models.Model):
    """
    FDA 483 observations and warning letter citations.
    Populated by the daily scraper task.
    """
    observation_text = models.TextField()
    cfr_section = models.CharField(max_length=100, blank=True)
    product_category = models.CharField(max_length=200, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    outcome = models.CharField(
        max_length=50,
        choices=[('483', '483 Observation'), ('warning_letter', 'Warning Letter'), ('vai', 'VAI'), ('nai', 'NAI')],
        default='483',
    )
    source_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # pgvector embedding — added as TextField now; migration replaces with VectorField when pgvector installed
    embedding_json = models.TextField(blank=True, help_text='JSON-serialized embedding vector')

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f"FDA {self.outcome} [{self.cfr_section}] {self.year}"


class SOPChunk(models.Model):
    """
    Chunked SOP content for RAG retrieval.
    """
    sop_name = models.CharField(max_length=300)
    sop_version = models.CharField(max_length=20, default='1.0')
    section_title = models.CharField(max_length=300, blank=True)
    chunk_text = models.TextField()
    department = models.CharField(max_length=100, blank=True)
    effective_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sop_chunks',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    # pgvector embedding stored as JSON for now
    embedding_json = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sop_name} v{self.sop_version} — {self.section_title}"
