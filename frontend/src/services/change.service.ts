import api from "./api";
import type { WorkflowMeta } from "./workflow.service";
import {type AuditTrailEntry } from "./audit.service";

export interface ChangeRecord extends Omit<Partial<WorkflowMeta>, 'id' | 'status'> {
  id: number;
  cc_id: string;
  title: string;
  department: string;
  description: string;
  justification: string;
  change_type: "STANDARD" | "PERMANENT" | "TEMPORARY" | "EMERGENCY";
  status: "DRAFT" | "EVALUATION" | "APPROVAL" | "IMPLEMENTATION" | "CLOSED";
  target_date: string;
  audit_trail?: AuditTrailEntry[];
  initiator_details?: { username: string; role: string };
  // ✅ Real field for Impact Assessment JSON
  impact_data?: {
    areas: Record<string, boolean>;
    risk_level: string;
    risk_notes: string;
    mitigation: string;
  };
}

export const changeService = {
  async list(): Promise<ChangeRecord[]> {
    const response = await api.get<ChangeRecord[]>("/quality/change-control/");
    return response.data;
  },

  async getById(id: string | number): Promise<ChangeRecord> {
    const response = await api.get<ChangeRecord>(`/quality/change-control/${id}/`);
    return response.data;
  },

  async create(data: Partial<ChangeRecord>) {
    const response = await api.post<ChangeRecord>("/quality/change-control/", data);
    return response.data;
  },

  async update(id: string | number, data: Partial<ChangeRecord>) {
    const payload = {
      ...data,
      change_reason: (data as any).change_reason || "Metadata update",
    };
    const response = await api.patch<ChangeRecord>(`/quality/change-control/${id}/`, payload);
    return response.data;
  },
};