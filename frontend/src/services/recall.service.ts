import api from "./api";

export interface RecallRecord {
  id: string;
  recall_number: string;
  product: string;
  batch_lots: string[];
  recall_class: "I" | "II" | "III";
  recall_class_display: string;
  reason: string;
  initiated_date: string;
  regulatory_notified: boolean;
  notification_date: string | null;
  status: "initiated" | "active" | "completed" | "closed";
  status_display: string;
  linked_complaint: string | null;
  linked_complaint_number: string | null;
  linked_nc: string | null;
  linked_nc_number: string | null;
  created_at: string;
  updated_at: string;
}

export const recallService = {
  async list(): Promise<RecallRecord[]> {
    const response = await api.get<RecallRecord[]>("/v1/recall/");
    return response.data;
  },

  async getById(id: string): Promise<RecallRecord> {
    const response = await api.get<RecallRecord>(`/v1/recall/${id}/`);
    return response.data;
  },

  async create(data: Partial<RecallRecord>): Promise<RecallRecord> {
    const response = await api.post<RecallRecord>("/v1/recall/", data);
    return response.data;
  },

  async update(id: string, data: Partial<RecallRecord>): Promise<RecallRecord> {
    const response = await api.patch<RecallRecord>(`/v1/recall/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esigPassword?: string) {
    const response = await api.post(`/v1/recall/${id}/transition/`, {
      action,
      reason,
      esig_password: esigPassword,
    });
    return response.data;
  },

  async active(): Promise<RecallRecord[]> {
    const response = await api.get<RecallRecord[]>("/v1/recall/active/");
    return response.data;
  },
};
