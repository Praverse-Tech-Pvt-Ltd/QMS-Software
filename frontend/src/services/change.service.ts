import api from "./api";
import type { WorkflowMeta } from "./workflow.service"; // ✅ Import from your merged workflow service

// --- TYPES ---

/**
 * ✅ CONSOLIDATED CHANGE RECORD INTERFACE
 * Merged from change.service.ts and change.types.ts
 * Omitting 'id' from WorkflowMeta to ensure the database numeric ID is used.
 */
export interface ChangeRecord extends Omit<Partial<WorkflowMeta>, 'id'> {
  id: number;           // Django Database Primary Key (Integer)
  cc_id: string;        // QMS Formatted ID (e.g., CC-2026-001)
  title: string;
  department: string;
  description: string;
  justification: string;
  
  // ✅ ENUM ALIGNMENT: Matches Django TextChoices exactly
  change_type: "STANDARD" | "PERMANENT" | "TEMPORARY" | "EMERGENCY";
  status: "DRAFT" | "EVALUATION" | "APPROVAL" | "IMPLEMENTATION" | "CLOSED";
  
  // ✅ UI & LIST HELPER FIELDS
  initiator?: string;
  owner?: string;
  priority?: "Low" | "Medium" | "High";
  target_date?: string; // Standardized lowercase 'd'
  submittedDate?: string;
  capa?: number;        // Linked CAPA ID
  
  // UI Helper for logic checks
  type?: "Major" | "Minor" | "Critical"; 
  moduleKey?: "change";
}

// --- SERVICE LOGIC ---

export const changeService = {
  // List all Change Control records
  async list(): Promise<ChangeRecord[]> {
    const response = await api.get<ChangeRecord[]>("/quality/change-control/");
    return response.data;
  },

  // Get a single record by numeric ID
  async getById(id: string | number): Promise<ChangeRecord> {
    const response = await api.get<ChangeRecord>(`/quality/change-control/${id}/`);
    return response.data;
  },

  // Create new change request metadata
  async create(data: Partial<ChangeRecord>) {
    const response = await api.post("/quality/change-control/", data);
    return response.data;
  },

  // Update record with Audit Reason (GxP Compliance)
  async update(id: string | number, data: Partial<ChangeRecord>) {
    const payload = {
      ...data,
      // ✅ 21 CFR Part 11: Capture the reason for change
      change_reason: (data as any).change_reason || "Change Control Metadata update",
    };
    const response = await api.patch(`/quality/change-control/${id}/`, payload);
    return response.data;
  },

  // Workflow Action: Submit for Impact Evaluation
  async submitForEvaluation(id: string | number) {
    return await api.post(`/quality/change-control/${id}/submit/`, {
      change_reason: "Initial submission for impact evaluation",
    });
  },

  // Workflow Action: Final Approval
  async approve(id: string | number) {
    return await api.post(`/quality/change-control/${id}/approve/`, {
       change_reason: "Change control impact assessment approved"
    });
  },
};