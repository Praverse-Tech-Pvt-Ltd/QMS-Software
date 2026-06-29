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

export const reportsService = {
  async getManagementReview(
    params?: { period_start?: string; period_end?: string; format?: "json" | "pdf" }
  ): Promise<ManagementReviewKPIs> {
    const response = await api.get<ManagementReviewKPIs>("/reports/management-review/", {
      params,
    });
    return response.data;
  },

  async listAPQR(params?: Record<string, string>): Promise<APQRReport[]> {
    const response = await api.get<APQRReport[]>("/reports/apqr/", { params });
    return response.data;
  },

  async getAPQR(id: string): Promise<APQRReport> {
    const response = await api.get<APQRReport>(`/reports/apqr/${id}/`);
    return response.data;
  },

  async generateAPQR(data: {
    product_name: string;
    product_code: string;
    period_start: string;
    period_end: string;
  }): Promise<APQRReport> {
    const response = await api.post<APQRReport>("/reports/apqr/generate/", data);
    return response.data;
  },

  async exportAuditTrail(params: {
    module?: string;
    record_id?: string;
    date_from?: string;
    date_to?: string;
    format: "pdf" | "excel";
  }): Promise<Blob> {
    const response = await api.get("/audit-trail/", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async exportAPQR(id: string): Promise<Blob> {
    const response = await api.get(`/reports/apqr/${id}/export/`, { responseType: "blob" });
    return response.data;
  },

  async exportManagementReview(period?: string): Promise<Blob> {
    const response = await api.get("/reports/management-review/", {
      params: { format: "pdf", ...(period ? { period } : {}) },
      responseType: "blob",
    });
    return response.data;
  },
};
