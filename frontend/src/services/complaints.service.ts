import api from "./api";

export interface ComplaintRecord {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  complaint_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  product_name?: string;
  batch_number?: string;
  customer_name?: string;
  customer_contact?: string;
  response_deadline?: string;
  days_overdue?: number;
  is_overdue?: boolean;
  created_at: string;
  created_by_detail?: { full_name: string };
}

export interface ComplaintTrend {
  month: string;
  count: number;
  critical_count: number;
}

export const complaintsService = {
  async list(params?: Record<string, string>): Promise<ComplaintRecord[]> {
    const response = await api.get<ComplaintRecord[]>("/complaints/", { params });
    return response.data;
  },

  async getById(id: string): Promise<ComplaintRecord> {
    const response = await api.get<ComplaintRecord>(`/complaints/${id}/`);
    return response.data;
  },

  async create(data: Partial<ComplaintRecord>): Promise<ComplaintRecord> {
    const response = await api.post<ComplaintRecord>("/complaints/", data);
    return response.data;
  },

  async update(id: string, data: Partial<ComplaintRecord>): Promise<ComplaintRecord> {
    const response = await api.patch<ComplaintRecord>(`/complaints/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esig_password?: string) {
    const response = await api.post(`/complaints/${id}/transition/`, {
      action,
      reason,
      esig_password,
    });
    return response.data;
  },

  async getOverdue(): Promise<ComplaintRecord[]> {
    const response = await api.get<ComplaintRecord[]>("/complaints/overdue/");
    return response.data;
  },

  async getTrends(): Promise<ComplaintTrend[]> {
    const response = await api.get<ComplaintTrend[]>("/complaints/trends/");
    return response.data;
  },

  async flagMDR(id: string, data: { reason: string }): Promise<void> {
    await api.post(`/complaints/${id}/flag-mdr/`, data);
  },
};
