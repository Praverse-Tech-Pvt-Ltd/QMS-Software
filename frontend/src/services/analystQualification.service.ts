import api from "./api";

export interface AnalyticalTechnique {
  id: string;
  name: string;
  complexity: "complex" | "non_complex";
  complexity_display: string;
  description: string;
  required_training_sop: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalystQualificationRecord {
  id: string;
  qualification_id: string;
  analyst: string;
  analyst_name: string;
  technique: string;
  technique_name: string;
  instrument: string | null;
  qualification_date: string | null;
  expiry_date: string | null;
  approved_by: string | null;
  status: "pending" | "under_review" | "qualified" | "not_qualified" | "expired";
  status_display: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface QualificationMatrixCell {
  status: AnalystQualificationRecord["status"];
  expiry_date: string | null;
}

/** { [analystId]: { [techniqueId]: QualificationMatrixCell } } */
export type QualificationMatrix = Record<string, Record<string, QualificationMatrixCell>>;

export const analystQualificationService = {
  async listTechniques(): Promise<AnalyticalTechnique[]> {
    const response = await api.get<AnalyticalTechnique[]>("/v1/analyst-qualification/techniques/");
    return response.data;
  },

  async createTechnique(data: Partial<AnalyticalTechnique>): Promise<AnalyticalTechnique> {
    const response = await api.post<AnalyticalTechnique>("/v1/analyst-qualification/techniques/", data);
    return response.data;
  },

  async listRecords(): Promise<AnalystQualificationRecord[]> {
    const response = await api.get<AnalystQualificationRecord[]>("/v1/analyst-qualification/records/");
    return response.data;
  },

  async createRecord(data: Partial<AnalystQualificationRecord>): Promise<AnalystQualificationRecord> {
    const response = await api.post<AnalystQualificationRecord>("/v1/analyst-qualification/records/", data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esigPassword?: string): Promise<AnalystQualificationRecord> {
    const response = await api.post<AnalystQualificationRecord>(`/v1/analyst-qualification/records/${id}/transition/`, {
      action,
      reason,
      esig_password: esigPassword,
    });
    return response.data;
  },

  async expiringRecords(): Promise<AnalystQualificationRecord[]> {
    const response = await api.get<AnalystQualificationRecord[]>("/v1/analyst-qualification/records/expiring/");
    return response.data;
  },

  async matrix(): Promise<QualificationMatrix> {
    const response = await api.get<QualificationMatrix>("/v1/analyst-qualification/records/matrix/");
    return response.data;
  },
};
