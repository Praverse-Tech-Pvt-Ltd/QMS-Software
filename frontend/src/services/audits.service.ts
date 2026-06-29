import api from "./api";

export interface AuditRecord {
  id: string;
  audit_number: string;
  audit_type: "internal" | "external" | "supplier" | "regulatory";
  title: string;
  status: string;
  lead_auditor: string;
  planned_start: string;
  planned_end: string;
  scope: string;
  created_at: string;
  created_by_detail?: { full_name: string };
  findings_count?: number;
  open_findings?: number;
}

export interface Finding {
  id: string;
  audit: string;
  finding_number: string;
  title: string;
  description: string;
  severity: "observation" | "minor" | "major" | "critical";
  status: string;
  linked_capa?: number;
}

export const auditsService = {
  async list(params?: Record<string, string>): Promise<AuditRecord[]> {
    const response = await api.get<AuditRecord[]>("/audits/", { params });
    return response.data;
  },

  async getById(id: string): Promise<AuditRecord> {
    const response = await api.get<AuditRecord>(`/audits/${id}/`);
    return response.data;
  },

  async create(data: Partial<AuditRecord>): Promise<AuditRecord> {
    const response = await api.post<AuditRecord>("/audits/", data);
    return response.data;
  },

  async update(id: string, data: Partial<AuditRecord>): Promise<AuditRecord> {
    const response = await api.patch<AuditRecord>(`/audits/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esig_password?: string) {
    const response = await api.post(`/audits/${id}/transition/`, {
      action,
      reason,
      esig_password,
    });
    return response.data;
  },

  async getFindings(id: string): Promise<Finding[]> {
    const response = await api.get<Finding[]>(`/audits/${id}/findings/`);
    return response.data;
  },

  async addFinding(id: string, data: Partial<Finding>): Promise<Finding> {
    const response = await api.post<Finding>(`/audits/${id}/findings/`, data);
    return response.data;
  },

  async generateReport(id: string): Promise<{ report_url: string }> {
    const response = await api.post(`/audits/${id}/report/`);
    return response.data;
  },
};
