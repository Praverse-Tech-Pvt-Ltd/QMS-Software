import api from "./api";

export interface RetentionPolicy {
  id: number;
  record_type: string;
  retention_years: number;
  regulatory_basis: string;
  created_at: string;
  updated_at: string;
}

export type RetentionPolicyUpdate = Partial<
  Pick<RetentionPolicy, "retention_years" | "regulatory_basis">
>;

export const retentionPolicyService = {
  async list(): Promise<RetentionPolicy[]> {
    const response = await api.get<RetentionPolicy[]>("/v1/core/retention-policies/");
    return response.data;
  },

  async update(id: number, data: RetentionPolicyUpdate): Promise<RetentionPolicy> {
    const response = await api.patch<RetentionPolicy>(`/v1/core/retention-policies/${id}/`, data);
    return response.data;
  },
};
