import api from "./api";

export interface SOPChunk {
  id: string;
  source_filename: string;
  chunk_index: number;
  text: string;
  similarity?: number;
}

export interface SOPQueryResult {
  query: string;
  results: SOPChunk[];
}

export interface FDA483Observation {
  id: string;
  citation_number: string;
  description: string;
  facility_type?: string;
  date_issued?: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  similarity?: number;
}

export interface SOPMetadata {
  sop_name: string;
  version: string;
  department: string;
  effective_date: string;
}

export interface SOPListItem {
  sop_name: string;
  version: string;
  department: string;
  effective_date: string | null;
  chunk_count: number;
  uploaded_by: string | null;
  created_at: string;
}

export const knowledgeService = {
  async uploadSOP(
    file: File,
    onProgress?: (pct: number) => void,
    metadata?: Partial<SOPMetadata>
  ): Promise<{ status: string; chunks_created: number }> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata?.sop_name) formData.append("sop_name", metadata.sop_name);
    if (metadata?.version) formData.append("version", metadata.version);
    if (metadata?.department) formData.append("department", metadata.department);
    if (metadata?.effective_date) formData.append("effective_date", metadata.effective_date);
    const response = await api.post("/knowledge/sop/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },

  async listSOPs(): Promise<SOPListItem[]> {
    const response = await api.get<SOPListItem[]>("/knowledge/sop/list/");
    return response.data;
  },

  async querySOP(query: string, topK = 5): Promise<SOPQueryResult> {
    const response = await api.get<SOPQueryResult>("/knowledge/sop/query/", {
      params: { query, top_k: topK },
    });
    return response.data;
  },

  async getFDARisk(query: string): Promise<FDA483Observation[]> {
    const response = await api.get<FDA483Observation[]>("/knowledge/fda-risk/", {
      params: { query },
    });
    return response.data;
  },
};
