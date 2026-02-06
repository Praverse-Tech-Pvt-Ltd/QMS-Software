import api from "./api";

export interface ChangeRecord {
  id: number;
  cc_id: string;
  title: string;
  description: string;
  justification: string;
  change_type: "PERMANENT" | "TEMPORARY" | "EMERGENCY";
  status: "DRAFT" | "EVALUATION" | "APPROVAL" | "IMPLEMENTATION" | "CLOSED";
  department: string;
  capa?: number;
  // UI Helpers
  moduleKey?: "change";
}

export const changeService = {
  // List
  async list(): Promise<ChangeRecord[]> {
    const response = await api.get<ChangeRecord[]>("/quality/change-control/");
    return response.data;
  },

  // Get Single
  async getById(id: string): Promise<ChangeRecord> {
    const response = await api.get<ChangeRecord>(`/quality/change-control/${id}/`);
    return response.data;
  },

  // Create
  async create(data: Partial<ChangeRecord>) {
    const response = await api.post("/quality/change-control/", data);
    return response.data;
  },

  // Update
  async update(id: string, data: Partial<ChangeRecord>) {
    const response = await api.patch(`/quality/change-control/${id}/`, data);
    return response.data;
  },

  // Workflow Actions
  async submitForEvaluation(id: string | number) {
    return await api.post(`/quality/change-control/${id}/submit/`);
  },

  async approve(id: string | number) {
    return await api.post(`/quality/change-control/${id}/approve/`);
  }
};