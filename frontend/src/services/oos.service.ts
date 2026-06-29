import api from "./api";

export interface OOSRecord {
  id: string;
  oos_number: string;
  sample_id: string;
  test_name: string;
  specification: string;
  result_obtained: string;
  unit?: string;
  status: string;
  phase: "phase1" | "phase2" | null;
  lab_error_confirmed?: boolean;
  phase1_conclusion?: string;
  phase2_initiated?: boolean;
  created_at: string;
}

export interface OOSStats {
  total: number;
  open: number;
  phase1_pending: number;
  phase2_pending: number;
  closed_lab_error: number;
  closed_confirmed_oos: number;
}

export const oosService = {
  async list(params?: Record<string, string>): Promise<OOSRecord[]> {
    const response = await api.get<OOSRecord[]>("/oos/", { params });
    return response.data;
  },

  async getById(id: string): Promise<OOSRecord> {
    const response = await api.get<OOSRecord>(`/oos/${id}/`);
    return response.data;
  },

  async create(data: Partial<OOSRecord>): Promise<OOSRecord> {
    const response = await api.post<OOSRecord>("/oos/", data);
    return response.data;
  },

  async transition(id: string, action: string, data?: Record<string, unknown>) {
    const response = await api.post(`/oos/${id}/transition/`, { action, ...data });
    return response.data;
  },

  async getStats(): Promise<OOSStats> {
    const response = await api.get<OOSStats>("/oos/stats/");
    return response.data;
  },
};
