import api from "./api";

// ✅ Types Definition
export interface DocumentVersion {
  version_number: string;
  file: string; // URL
  change_log: string;
  created_at: string;
}

export interface DmsDocument {
  id: number;
  document_id: string; // e.g. "SOP-2026-001"
  title: string;
  doc_type: "SOP" | "POL" | "WI" | "FORM";
  status: "DRAFT" | "REVIEW" | "APPROVED" | "EFFECTIVE" | "OBSOLETE";
  department: string;
  latest_version?: DocumentVersion;
  owner: number; // User ID
  created_at: string;
  updatedAt?: string;
}

// ✅ Service Implementation
export const dmsService = {
  // List
  async list(): Promise<DmsDocument[]> {
    const response = await api.get<DmsDocument[]>("/dms/documents/");
    return response.data;
  },

  // Get Single
  async getById(id: string): Promise<DmsDocument> {
    const response = await api.get<DmsDocument>(`/dms/documents/${id}/`);
    return response.data;
  },

  // Create (Metadata only)
  async create(data: Partial<DmsDocument>) {
    const response = await api.post("/dms/documents/", data);
    return response.data;
  },

  // Update
  async update(id: string, data: Partial<DmsDocument>) {
    const response = await api.patch(`/dms/documents/${id}/`, data);
    return response.data;
  },

  // Upload Version (File Upload)
  async uploadVersion(docId: string | number, file: File, versionNumber: string, changeLog: string) {
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