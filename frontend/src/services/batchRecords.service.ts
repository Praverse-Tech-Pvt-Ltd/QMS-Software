import api from "./api";

export interface MasterBatchRecord {
  id: string;
  mbr_number: string;
  product_name: string;
  product_code: string;
  version: string;
  status: string;
  batch_size: number;
  batch_size_unit: string;
  steps?: MBRStep[];
}

export interface MBRStep {
  id: string;
  master_batch_record: string;
  step_number: number;
  title: string;
  instructions: string;
  critical_step: boolean;
  expected_value?: string;
  tolerance?: string;
  unit?: string;
}

export interface BatchProductionRecord {
  id: string;
  bpr_number: string;
  master_batch_record: string;
  mbr_detail?: Pick<MasterBatchRecord, "mbr_number" | "product_name">;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: string;
  yield_percentage?: number;
  release_status?: string;
  steps?: BPRStep[];
}

export interface BPRStep {
  id: string;
  batch_production_record: string;
  mbr_step: string;
  actual_value?: string;
  in_range?: boolean;
  performed_by?: string;
  performed_at?: string;
  deviation_triggered?: boolean;
}

export const batchRecordsService = {
  async listMBR(params?: Record<string, string>): Promise<MasterBatchRecord[]> {
    const response = await api.get<MasterBatchRecord[]>("/batch-records/mbr/", { params });
    return response.data;
  },

  async getMBR(id: string): Promise<MasterBatchRecord> {
    const response = await api.get<MasterBatchRecord>(`/batch-records/mbr/${id}/`);
    return response.data;
  },

  async createMBR(data: Partial<MasterBatchRecord>): Promise<MasterBatchRecord> {
    const response = await api.post<MasterBatchRecord>("/batch-records/mbr/", data);
    return response.data;
  },

  async listBPR(params?: Record<string, string>): Promise<BatchProductionRecord[]> {
    const response = await api.get<BatchProductionRecord[]>("/batch-records/bpr/", { params });
    return response.data;
  },

  async getBPR(id: string): Promise<BatchProductionRecord> {
    const response = await api.get<BatchProductionRecord>(`/batch-records/bpr/${id}/`);
    return response.data;
  },

  async createBPR(data: Partial<BatchProductionRecord>): Promise<BatchProductionRecord> {
    const response = await api.post<BatchProductionRecord>("/batch-records/bpr/", data);
    return response.data;
  },

  async recordStep(bprId: string, stepId: string, data: Partial<BPRStep>): Promise<BPRStep> {
    const response = await api.patch<BPRStep>(
      `/batch-records/bpr/${bprId}/steps/${stepId}/`,
      data
    );
    return response.data;
  },

  async releaseBatch(bprId: string, esig_password: string, reason?: string): Promise<void> {
    await api.post(`/batch-records/bpr/${bprId}/transition/`, {
      action: "released",
      esig_password,
      reason,
    });
  },
};
