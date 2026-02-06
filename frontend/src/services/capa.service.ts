import api from "./api";

export interface CapaRecord {
  id: number;
  capa_id: string;
  deviation: number; // Linked Deviation ID
  title: string;
  description: string;
  action_type: "CORRECTIVE" | "PREVENTIVE";
  status: "PLANNING" | "PENDING" | "IMPLEMENTATION" | "VERIFICATION" | "CLOSED";
  due_date: string;
  // UI Helpers
  moduleKey?: "capa";
}

export const capaService = {
  // List
  async list(): Promise<CapaRecord[]> {
    const response = await api.get<CapaRecord[]>("/quality/capa/");
    return response.data;
  },

  // Get Single
  async getById(id: string): Promise<CapaRecord> {
    const response = await api.get<CapaRecord>(`/quality/capa/${id}/`);
    return response.data;
  },

  // Create
  async create(data: Partial<CapaRecord>) {
    const response = await api.post("/quality/capa/", data);
    return response.data;
  },

  // Update
  async update(id: string, data: Partial<CapaRecord>) {
    const response = await api.patch(`/quality/capa/${id}/`, data);
    return response.data;
  },

  // Workflow Action
  async startImplementation(id: string | number) {
    return await api.post(`/quality/capa/${id}/start/`);
  }
};