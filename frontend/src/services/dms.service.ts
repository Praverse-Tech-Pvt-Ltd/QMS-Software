import api from "./api";
import type { WorkflowStatus, ApprovalRequest, SignatureEntry } from "./workflow.service";

// --- TYPES ---

export interface DocumentVersion {
  version_number: string;
  file: string; // URL to file
  change_log: string;
  created_at: string;
}

/**
 * ✅ CONSOLIDATED DMS DOCUMENT INTERFACE
 * Merged from dms.service.ts and dms.types.ts
 */
export interface DmsDocument {
  // Numeric ID for database lookups, string for workflow engine compatibility
  id: number; 
  document_id: string; // e.g. "SOP-QA-2026-001"
  title: string;
  department: string;
  
  // ✅ ALIGNMENT: Mapping UI types to Backend DocType codes
  doc_type: "SOP" | "POL" | "WI" | "FORM"; 
  status: WorkflowStatus;
  
  // Versioning
  latest_version?: DocumentVersion;
  version: string; // UI-friendly version string (e.g. "1.0")
  
  // Metadata & Detail fields
  owner: number | string; // ID or Name depending on context
  description?: string;
  effectiveDate?: string;
  nextReview?: string;
  created_at: string;
  updatedAt?: string;

  // ✅ Workflow Integration
  approvalRequests?: ApprovalRequest[];
  signatureLog?: SignatureEntry[];
  moduleKey?: "dms";
}

// --- SERVICE LOGIC ---

export const dmsService = {
  // List all documents
  async list(): Promise<DmsDocument[]> {
    const response = await api.get<DmsDocument[]>("/dms/documents/");
    return response.data;
  },

  // Get single document by ID
  async getById(id: string | number): Promise<DmsDocument> {
    const response = await api.get<DmsDocument>(`/dms/documents/${id}/`);
    return response.data;
  },

  // Create document metadata
  async create(data: Partial<DmsDocument>) {
    const response = await api.post("/dms/documents/", data);
    return response.data;
  },

  // Update document metadata
  async update(id: string | number, data: Partial<DmsDocument>) {
    const response = await api.patch(`/dms/documents/${id}/`, data);
    return response.data;
  },

  // ✅ FILE UPLOAD: GxP compliant version upload
  async uploadVersion(
    docId: string | number, 
    file: File, 
    versionNumber: string, 
    changeLog: string
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("version_number", versionNumber);
    formData.append("change_log", changeLog);

    const response = await api.post(`/dms/documents/${docId}/upload_version/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};