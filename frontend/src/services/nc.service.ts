import api from "./api";

export interface NCRecord {
  id: string;
  nc_number: string;
  title: string;
  description: string;
  nc_type: string;
  status: string;
  product_name?: string;
  batch_number?: string;
  quantity_affected?: number;
  unit?: string;
  defect_category?: string;
  severity: "minor" | "major" | "critical";
  is_repeat?: boolean;
  on_hold?: boolean;
  created_at: string;
  created_by_detail?: { full_name: string };
}

export interface HoldRecord {
  id: string;
  nc_report: string;
  location: string;
  quantity: number;
  hold_reason: string;
  hold_date: string;
  released_at?: string;
  esignature?: string;
}

export interface Disposition {
  id: string;
  nc_report: string;
  decision: "release" | "rework" | "retest" | "reject" | "destroy";
  justification: string;
  decided_by_detail?: { full_name: string };
  decided_at?: string;
}

export const ncService = {
  async list(params?: Record<string, string>): Promise<NCRecord[]> {
    const response = await api.get<NCRecord[]>("/nc/", { params });
    return response.data;
  },

  async getById(id: string): Promise<NCRecord> {
    const response = await api.get<NCRecord>(`/nc/${id}/`);
    return response.data;
  },

  async create(data: Partial<NCRecord>): Promise<NCRecord> {
    const response = await api.post<NCRecord>("/nc/", data);
    return response.data;
  },

  async update(id: string, data: Partial<NCRecord>): Promise<NCRecord> {
    const response = await api.patch<NCRecord>(`/nc/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esig_password?: string) {
    const response = await api.post(`/nc/${id}/transition/`, {
      action,
      reason,
      esig_password,
    });
    return response.data;
  },

  async placeHold(id: string, data: Partial<HoldRecord>): Promise<HoldRecord> {
    const response = await api.post<HoldRecord>(`/nc/${id}/hold/`, data);
    return response.data;
  },

  async releaseHold(id: string, esig_password: string): Promise<void> {
    await api.post(`/nc/${id}/release-hold/`, { esig_password });
  },

  async dispose(id: string, data: Partial<Disposition> & { esig_password: string }): Promise<Disposition> {
    const response = await api.post<Disposition>(`/nc/${id}/dispose/`, data);
    return response.data;
  },

  async getTrends(): Promise<{ month: string; count: number }[]> {
    const response = await api.get("/nc/trends/");
    return response.data;
  },
};
