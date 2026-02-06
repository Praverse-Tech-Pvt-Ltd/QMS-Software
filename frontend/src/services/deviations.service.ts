import api from "./api";

// We define the interface to match your Django Backend (snake_case)
// If your UI expects camelCase, you might need to map fields here.
export interface DeviationRecord {
  id: number;
  deviation_id: string; // Backend sends 'deviation_id'
  title: string;
  description: string;
  department: string;
  risk_level: "CRITICAL" | "MAJOR" | "MINOR";
  status: "DRAFT" | "SUBMITTED" | "INVESTIGATION" | "QA_REVIEW" | "APPROVED" | "CLOSED";
  event_date: string;
  created_at: string;
  // UI Helpers (Optional mapping if needed)
  moduleKey?: "deviations"; 
}

export const deviationsService = {
  // List
  async list(): Promise<DeviationRecord[]> {
    const response = await api.get<DeviationRecord[]>("/quality/deviations/");
    return response.data;
  },

  // Get Single
  async getById(id: string): Promise<DeviationRecord> {
    const response = await api.get<DeviationRecord>(`/quality/deviations/${id}/`);
    return response.data;
  },

  // Create
  async create(data: Partial<DeviationRecord>) {
    const response = await api.post("/quality/deviations/", data);
    return response.data;
  },

  // Update
  async update(id: string, data: Partial<DeviationRecord>) {
    const response = await api.patch(`/quality/deviations/${id}/`, data);
    return response.data;
  },

  // Workflow Action (Submit)
  async submit(id: string | number) {
    return await api.post(`/quality/deviations/${id}/submit/`);
  }
};