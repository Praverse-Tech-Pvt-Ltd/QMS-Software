import api from "./api";

export interface RiskRecord {
  id: string;
  risk_number: string;
  title: string;
  description: string;
  risk_category: string;
  status: string;
  severity: number;
  occurrence: number;
  detectability: number;
  rpn: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  product?: string;
  process?: string;
  created_at: string;
  mitigations?: Mitigation[];
  residual?: ResidualRisk;
}

export interface Mitigation {
  id: string;
  risk: string;
  description: string;
  mitigation_type: string;
  status: string;
  owner: string;
  due_date: string;
}

export interface ResidualRisk {
  id: string;
  residual_severity: number;
  residual_occurrence: number;
  residual_detectability: number;
  residual_rpn: number;
  residual_risk_level: string;
  acceptable: boolean;
  justification: string;
}

export interface RiskMatrixCell {
  severity: number;
  occurrence: number;
  risk_level: string;
  count: number;
  risks: { id: string; title: string }[];
}

export const risksService = {
  async list(params?: Record<string, string>): Promise<RiskRecord[]> {
    const response = await api.get<RiskRecord[]>("/risks/", { params });
    return response.data;
  },

  async getById(id: string): Promise<RiskRecord> {
    const response = await api.get<RiskRecord>(`/risks/${id}/`);
    return response.data;
  },

  async create(data: Partial<RiskRecord>): Promise<RiskRecord> {
    const response = await api.post<RiskRecord>("/risks/", data);
    return response.data;
  },

  async update(id: string, data: Partial<RiskRecord>): Promise<RiskRecord> {
    const response = await api.patch<RiskRecord>(`/risks/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esig_password?: string) {
    const response = await api.post(`/risks/${id}/transition/`, {
      action,
      reason,
      esig_password,
    });
    return response.data;
  },

  async mitigate(id: string, data: Partial<Mitigation>): Promise<Mitigation> {
    const response = await api.post<Mitigation>(`/risks/${id}/mitigate/`, data);
    return response.data;
  },

  async reassess(id: string, data: Partial<ResidualRisk>): Promise<ResidualRisk> {
    const response = await api.post<ResidualRisk>(`/risks/${id}/reassess/`, data);
    return response.data;
  },

  async getMatrix(): Promise<RiskMatrixCell[]> {
    const response = await api.get<RiskMatrixCell[]>("/risks/matrix/");
    return response.data;
  },
};
