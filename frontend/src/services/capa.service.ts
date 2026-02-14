import api from "./api";
import type { WorkflowMeta } from "./workflow.service"; // ✅ Assumes types are now in workflow.service


export interface CapaRecord extends Omit<Partial<WorkflowMeta>, 'id'> {
  id: number;           // Django Database Primary Key
  capa_id: string;      // QMS Formatted ID (e.g., CAPA-2026-001)
  deviation?: number;   // Linked Deviation Database ID
  title: string;
  description: string;
  department: string;
  
  // ✅ ENUM ALIGNMENT: Standardized to Django Choices
  action_type: "CORRECTIVE" | "PREVENTIVE";
  status: "PLANNING" | "PENDING" | "IMPLEMENTATION" | "VERIFICATION" | "CLOSED";
  
  // ✅ UI & LIST HELPER FIELDS
  initiator?: string;
  owner?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  due_date: string;     // Matches Django model
  target_date?: string; // Matches Django target_date
  
  // Detail investigation fields
  source?: string;      // e.g., "Deviation DEV-042"
  root_cause?: string;
  proposed_plan?: string;
  
  moduleKey?: "capa";
}

// --- SERVICE LOGIC ---

export const capaService = {
  // List all records
  async list(): Promise<CapaRecord[]> {
    const response = await api.get<CapaRecord[]>("/quality/capa/");
    return response.data;
  },

  // Get single record by ID
  async getById(id: string | number): Promise<CapaRecord> {
    const response = await api.get<CapaRecord>(`/quality/capa/${id}/`);
    return response.data;
  },

  // Create new CAPA metadata
  async create(data: Partial<CapaRecord>) {
    const response = await api.post("/quality/capa/", data);
    return response.data;
  },

  // Update record with Audit Reason
  async update(id: string | number, data: Partial<CapaRecord>) {
    const payload = {
      ...data,
      // ✅ 21 CFR Part 11: Capture the reason from UI or use default
      change_reason: (data as any).change_reason || "CAPA investigation update",
    };
    const response = await api.patch(`/quality/capa/${id}/`, payload);
    return response.data;
  },

  // Workflow Action: Initiate implementation phase
  async startImplementation(id: string | number) {
    return await api.post(`/quality/capa/${id}/start/`, {
      change_reason: "Transitioning to implementation phase",
    });
  },
};