import api from "./api";

export interface EMSamplingPlan {
  id: string;
  area: string;
  classification: "A" | "B" | "C" | "D";
  classification_display: string;
  monitoring_type: "viable" | "non_viable";
  monitoring_type_display: string;
  frequency: string;
  action_limit: string;
  alert_limit: string;
  created_at: string;
  updated_at: string;
}

export interface EMResult {
  id: string;
  sampling_plan: string;
  area: string;
  sampling_date: string;
  sampled_by: number;
  sampled_by_name: string;
  result_value: string;
  result_status: "normal" | "alert" | "action";
  result_status_display: string;
  linked_deviation: string | null;
  created_at: string;
}

export interface EMTrend {
  area: string;
  dates: string[];
  values: number[];
  action_limit: number | null;
  alert_limit: number | null;
}

export const environmentalService = {
  async listSamplingPlans(): Promise<EMSamplingPlan[]> {
    const response = await api.get<EMSamplingPlan[]>("/v1/environmental/sampling-plans/");
    return response.data;
  },

  async createSamplingPlan(data: Partial<EMSamplingPlan>): Promise<EMSamplingPlan> {
    const response = await api.post<EMSamplingPlan>("/v1/environmental/sampling-plans/", data);
    return response.data;
  },

  async listResults(params?: { area?: string }): Promise<EMResult[]> {
    const response = await api.get<EMResult[]>("/v1/environmental/results/", { params });
    return response.data;
  },

  async createResult(data: { sampling_plan: string; sampling_date: string; result_value: string }): Promise<EMResult> {
    const response = await api.post<EMResult>("/v1/environmental/results/", data);
    return response.data;
  },

  async getTrends(area: string, months = 6, monitoringType?: string): Promise<EMTrend> {
    const response = await api.get<EMTrend>("/v1/environmental/results/trends/", {
      params: { area, months, monitoring_type: monitoringType },
    });
    return response.data;
  },
};
