import api from "./api";
import type {
  WorkflowStatus,
  ApprovalRequest,
  SignatureEntry,
} from "./workflow.service";

// --- TYPES ---

export interface DocumentVersion {
  version_number: string;
  file: string; // URL to file
  change_log: string;
  created_at: string;
}

/**
 * ✅ CONSOLIDATED DMS DOCUMENT INTERFACE
 */
export interface DmsDocument {
  id: number;
  document_id: string; // Used for routing
  title: string;
  department: string;
  doc_type: "SOP" | "POL" | "WI" | "FORM";
  status: WorkflowStatus;

  latest_version?: DocumentVersion;
  versions?: DocumentVersion[]; // For history list
  version: string;

  owner: number | string;
  description?: string;
  effectiveDate?: string;
  nextReview?: string;
  created_at: string;
  updatedAt?: string;

  approvalRequests?: ApprovalRequest[];
  signatureLog?: SignatureEntry[];
  audit_trail?: any[]; // For audit trail table
  moduleKey?: "dms";
}

// --- SERVICE LOGIC ---

export const dmsService = {
  async list(): Promise<DmsDocument[]> {
    const response = await api.get<DmsDocument[]>("/dms/documents/");
    return response.data;
  },

  // ✅ Fixed: Use the 'id' parameter (which is the document_id string)
  async getById(id: string | number): Promise<DmsDocument> {
    const response = await api.get<DmsDocument>(`/dms/documents/${id}/`);
    return response.data;
  },

  async create(data: Partial<DmsDocument>) {
    const response = await api.post("/dms/documents/", data);
    return response.data;
  },

  // ✅ Fixed: Explicitly handle change_reason in payload
  async update(
    id: string | number,
    data: Partial<DmsDocument> & { change_reason?: string },
  ) {
    const response = await api.patch(`/dms/documents/${id}/`, data);
    return response.data;
  },

  async uploadVersion(
    docId: string | number,
    file: File,
    versionNumber: string,
    changeLog: string,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("version_number", versionNumber);
    formData.append("change_log", changeLog);

    const response = await api.post(
      `/dms/documents/${docId}/upload_version/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};