import api from "./api";

export interface StabilityPullPoint {
  id: string;
  protocol: string;
  time_point: string;
  scheduled_date: string;
  actual_date: string | null;
  status: "pending" | "pulled" | "overdue" | "completed";
  status_display: string;
  linked_sample: string | null;
  oot_flag: boolean;
  ai_remark_draft: string;
}

export interface StabilityProtocol {
  id: string;
  protocol_number: string;
  product: string;
  batch_lot: string;
  study_type: "long_term" | "accelerated" | "intermediate" | "stress";
  study_type_display: string;
  storage_condition: string;
  study_start_date: string;
  planned_end_date: string;
  status: "draft" | "approved" | "closed";
  status_display: string;
  pull_points: StabilityPullPoint[];
  progress: { total: number; completed: number };
  created_at: string;
  updated_at: string;
}

export const stabilityService = {
  async list(): Promise<StabilityProtocol[]> {
    const response = await api.get<StabilityProtocol[]>("/v1/stability/protocols/");
    return response.data;
  },

  async getById(id: string): Promise<StabilityProtocol> {
    const response = await api.get<StabilityProtocol>(`/v1/stability/protocols/${id}/`);
    return response.data;
  },

  async create(data: Partial<StabilityProtocol>): Promise<StabilityProtocol> {
    const response = await api.post<StabilityProtocol>("/v1/stability/protocols/", data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esigPassword?: string) {
    const response = await api.post(`/v1/stability/protocols/${id}/transition/`, {
      action,
      reason,
      esig_password: esigPassword,
    });
    return response.data;
  },

  async updatePullPoint(id: string, data: Partial<StabilityPullPoint>): Promise<StabilityPullPoint> {
    const response = await api.patch<StabilityPullPoint>(`/v1/stability/pull-points/${id}/`, data);
    return response.data;
  },

  async upcomingPullPoints(): Promise<StabilityPullPoint[]> {
    const response = await api.get<StabilityPullPoint[]>("/v1/stability/pull-points/upcoming/");
    return response.data;
  },
};
