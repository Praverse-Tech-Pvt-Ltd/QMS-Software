import api from "./api";
import type { WorkflowMeta } from "./workflow.service";
import {type  AuditTrailEntry } from "./audit.service";

export interface DeviationRecord extends Omit<Partial<WorkflowMeta>, 'id'| 'status'> {
  id: number;
  deviation_id: string; 
  title: string;
  description: string;
  department: string;
  
  // ✅ Backend Alignments
  risk_level: "CRITICAL" | "MAJOR" | "MINOR";
  status: "DRAFT" | "INVESTIGATION" | "QA_REVIEW" | "CLOSED" | "UNDER_REVIEW" | "APPROVED";
  
  occurrence_date: string;
  created_at: string;
  
  // ✅ Investigation Fields (Binding these ensures they SAVE)
  immediate_actions?: string;
  root_cause?: string;
  
  // ✅ Audit Trail
  audit_trail?: AuditTrailEntry[];
  change_reason?: string;
  capas?: any[];
}

export const deviationsService = {
  async list(): Promise<DeviationRecord[]> {
    const response = await api.get<DeviationRecord[]>("/quality/deviations/");
    return response.data;
  },

  async getById(id: string | number): Promise<DeviationRecord> {
    const response = await api.get<DeviationRecord>(`/quality/deviations/${id}/`);
    return response.data;
  },

  async update(id: string | number, data: Partial<DeviationRecord>) {
    const payload = {
      ...data,
      change_reason: data.change_reason || "Deviation investigation update",
    };
    const response = await api.patch(`/quality/deviations/${id}/`, payload);
    return response.data;
  },

  async submit(id: string | number, reason: string) {
    return await api.post(`/quality/deviations/${id}/submit/`, {
      change_reason: reason,
    });
  },
};