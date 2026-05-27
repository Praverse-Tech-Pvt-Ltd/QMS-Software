import api from "./api";
import type { WorkflowMeta } from "./workflow.service";
import { type AuditTrailEntry } from "./audit.service";

export interface AuditLog {
  id: number;
  action: string;
  timestamp: string;
  user_name: string; 
  reason?: string;
  changes?: any;
}

export interface CapaAction {
  id: number;
  description: string;
  owner: string;
  due_date: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}

export interface CapaRecord extends Omit<Partial<WorkflowMeta>, "id" | "status"> {
  id: number; // Django Database Primary Key
  capa_id: string; // QMS Formatted ID (e.g., CAPA-2026-001)
  deviation?: number; // Linked Deviation Database ID
  title: string;
  description: string;
  department: string;
  action_type: "CORRECTIVE" | "PREVENTIVE";
  status:
    | "PLANNING"
    | "PENDING"
    | "IMPLEMENTATION"
    | "VERIFICATION"
    | "VERIFIED"
    | "CLOSED";
  initiator?: string;
  owner?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  due_date: string; 
  target_date?: string; 
  actions?: CapaAction[];
  source?: string; 
  root_cause?: string;
  proposed_plan?: string;
  change_reason?: string;
  audit_trail?: AuditTrailEntry[];
  signatures?: any[]; // ✅ Unified with DetailPage usage
  moduleKey?: "capa";
}

export const capaService = {
  async list(): Promise<CapaRecord[]> {
    const response = await api.get<CapaRecord[]>("/quality/capa/");
    return response.data;
  },

  async getById(id: string | number): Promise<CapaRecord> {
    // This 'id' is the capa_id string from the URL
    const response = await api.get<CapaRecord>(`/quality/capa/${id}/`);
    return response.data;
  },

  async create(data: Partial<CapaRecord>) {
    const response = await api.post("/quality/capa/", data);
    return response.data;
  },

  async addAction(id: string | number, actionData: any) {
    const response = await api.post(`/quality/capa/${id}/add-action/`, actionData);
    return response.data;
  },

  async update(id: string | number, data: Partial<CapaRecord> & { change_reason?: string }) {
    const response = await api.patch(`/quality/capa/${id}/`, data);
    return response.data;
  },

  async startImplementation(id: string | number) {
    return await api.post(`/quality/capa/${id}/start/`, {
      change_reason: "Transitioning to implementation phase",
    });
  },
};