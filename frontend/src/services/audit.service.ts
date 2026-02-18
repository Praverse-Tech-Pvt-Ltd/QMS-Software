import api from "./api";

// --- TYPES ---
export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "APPROVAL"
  | "E_SIGNATURE"   
  | "REJECT"
  | "ATTACHMENT_ADD"
  | "FIELD_EDIT"
  | "LINKED_RECORD"; // ✅ Added for Deviation -> CAPA linking

export interface AuditTrailEntry {
  id: string | number;
  recordId: string;       
  moduleKey: string;     
  actionType: AuditActionType;
  
  field?: string;
  oldValue?: string;
  newValue?: string;
  
  changes?: Record<string, { old: any; new: any }>;

  user: string;          
  role: string;          
  timestamp: string;
  reason?: string;
}

// --- SERVICE LOGIC ---
export const auditService = {
  async list(moduleKey: string, recordId: string): Promise<AuditTrailEntry[]> {
    try {
      const response = await api.get<AuditTrailEntry[]>(`/quality/${moduleKey}/${recordId}/history/`);
      
      return response.data.map(log => ({
        ...log,
        moduleKey,
        recordId: String(recordId)
      }));
    } catch (err) {
      console.warn(`Audit history not found for ${moduleKey}:${recordId}. Using fallback.`);
      return this.getFallbackSeed(moduleKey, recordId);
    }
  },

  async add(
    moduleKey: string,
    recordId: string,
    entry: Omit<AuditTrailEntry, "id" | "timestamp" | "recordId" | "moduleKey">
  ): Promise<AuditTrailEntry> {
    const payload = {
      ...entry,
      module_key: moduleKey, // ✅ Standardized to snake_case for Django
      record_id: recordId,
      change_reason: entry.reason
    };

    const response = await api.post<AuditTrailEntry>(`/quality/${moduleKey}/${recordId}/history/`, payload);
    return response.data;
  },

  getFallbackSeed(moduleKey: string, recordId: string): AuditTrailEntry[] {
    return [
      {
        id: "seed-0",
        recordId: String(recordId),
        moduleKey,
        actionType: "CREATE",
        user: "System",
        role: "System",
        timestamp: new Date().toISOString(),
        reason: "Initial record tracking started.",
      },
    ];
  }
};