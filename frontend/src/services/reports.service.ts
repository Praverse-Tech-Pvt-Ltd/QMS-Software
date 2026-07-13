import api from "./api";

export interface ManagementReviewKPIs {
  period_start: string;
  period_end: string;
  deviations: { total: number; open: number; overdue: number };
  capas: { total: number; open: number; overdue: number };
  audits: { total: number; open_findings: number; critical_findings: number };
  complaints: { total: number; critical: number; overdue: number };
  risks: { total: number; critical: number; high: number };
  training: { total_assignments: number; overdue: number; compliance_rate: number };
  suppliers: { total: number; expiring_soon: number };
}

export interface APQRReport {
  id: string;
  report_number: string;
  product_name: string;
  product_code: string;
  period_start: string;
  period_end: string;
  status: string;
  batch_count?: number;
  oos_count?: number;
  created_at: string;
}

export type SPCMetric = "deviation_rate" | "capa_cycle_time" | "oos_rate" | "complaint_rate";

export interface SPCData {
  values: number[];
  dates: string[];
  mean: number;
  ucl: number;
  lcl: number;
}

export const reportsService = {
  async getSPC(metric: SPCMetric, months = 12, product?: string): Promise<SPCData> {
    const response = await api.get<SPCData>("/v1/reports/spc/", {
      params: { metric, months, product },
    });
    return response.data;
  },

  async getManagementReview(
    params?: { period_start?: string; period_end?: string; format?: "json" | "pdf" }
  ): Promise<ManagementReviewKPIs> {
    const response = await api.get<ManagementReviewKPIs>("/v1/reports/management-review/", {
      params,
    });
    return response.data;
  },

  async listAPQR(params?: Record<string, string>): Promise<APQRReport[]> {
    const response = await api.get<APQRReport[]>("/v1/reports/apqr/", { params });
    return response.data;
  },

  async getAPQR(id: string): Promise<APQRReport> {
    const response = await api.get<APQRReport>(`/v1/reports/apqr/${id}/`);
    return response.data;
  },

  async generateAPQR(data: {
    product_name: string;
    product_code: string;
    period_start: string;
    period_end: string;
  }): Promise<APQRReport> {
    const response = await api.post<APQRReport>("/v1/reports/apqr/generate/", data);
    return response.data;
  },

  async exportAuditTrail(params: {
    module?: string;
    record_id?: string;
    date_from?: string;
    date_to?: string;
    format: "pdf" | "excel";
  }): Promise<Blob> {
    const response = await api.get("/v1/audit-trail/", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async exportAPQR(id: string): Promise<Blob> {
    const response = await api.get(`/v1/reports/apqr/${id}/export/`, { responseType: "blob" });
    return response.data;
  },

  async exportManagementReview(period?: string): Promise<Blob> {
    const response = await api.get("/v1/reports/management-review/", {
      params: { format: "pdf", ...(period ? { period } : {}) },
      responseType: "blob",
    });
    return response.data;
  },
};
