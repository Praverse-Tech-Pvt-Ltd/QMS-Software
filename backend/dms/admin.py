from django.contrib import admin
from .models import Document, DocumentVersion

class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0 

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['document_id', 'title', 'doc_type', 'status', 'owner', 'updated_at']
    list_filter = ['doc_type', 'status', 'department']
    search_fields = ['title', 'document_id']
    inlines = [DocumentVersionInline]