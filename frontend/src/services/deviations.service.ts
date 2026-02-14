import api from "./api";
import type { WorkflowMeta } from "./workflow.service"; // ✅ Import from your merged workflow service

// --- TYPES ---

/**
 * ✅ CONSOLIDATED DEVIATION RECORD INTERFACE
 * Merged from deviations.service.ts and deviation.types.ts
 * Omitting 'id' from WorkflowMeta to allow 'number' for database ID.
 */
export interface DeviationRecord extends Omit<Partial<WorkflowMeta>, 'id'> {
  id: number;           // Django Database Primary Key
  deviation_id: string; // QMS Formatted ID (e.g., DEV-2026-001)
  title: string;
  description: string;
  department: string;
  
  // ✅ ENUM ALIGNMENT: Standardized to Django TextChoices
  risk_level: "CRITICAL" | "MAJOR" | "MINOR";
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "INVESTIGATION"
    | "QA_REVIEW"
    | "APPROVED"
    | "CLOSED";
  
  // ✅ DATE FIELDS: Standardized to backend naming
  event_date: string;   // Date of occurrence
  created_at: string;
  
  // ✅ UI & LIST HELPER FIELDS
  reportedBy?: string;
  reportedDate?: string;
  severity?: "Minor" | "Major" | "Critical"; // UI-friendly display
  
  // Detail investigation fields
  location?: string;
  immediateAction?: string;
  root_cause?: string;
  type?: string;

  moduleKey?: "deviations";
}

// --- SERVICE LOGIC ---

export const deviationsService = {
  // List all deviations
  async list(): Promise<DeviationRecord[]> {
    const response = await api.get<DeviationRecord[]>("/quality/deviations/");
    return response.data;
  },

  // Get single record by ID
  async getById(id: string | number): Promise<DeviationRecord> {
    const response = await api.get<DeviationRecord>(
      `/quality/deviations/${id}/`,
    );
    return response.data;
  },

  // Create new deviation event
  async create(data: Partial<DeviationRecord>) {
    const response = await api.post("/quality/deviations/", data);
    return response.data;
  },

  // Update record with Audit Reason (GxP Compliance)
  async update(id: string | number, data: Partial<DeviationRecord>) {
    const payload = {
      ...data,
      // ✅ 21 CFR Part 11: Capture the reason from UI or use default
      change_reason: (data as any).change_reason || "Metadata update",
    };
    const response = await api.patch(`/quality/deviations/${id}/`, payload);
    return response.data;
  },

  // Workflow Action: Submit for QA Review
  async submit(id: string | number) {
    return await api.post(`/quality/deviations/${id}/submit/`, {
      change_reason: "Investigation completed and submitted for QA Review",
    });
  },
};