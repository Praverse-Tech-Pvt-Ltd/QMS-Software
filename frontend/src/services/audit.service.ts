import api from "./api";

// --- TYPES ---
export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "APPROVAL"
  | "E_SIGNATURE"   
  | "REJECT"
  | "REJECT"
  | "ATTACHMENT_ADD"
  | "FIELD_EDIT";


export interface AuditTrailEntry {
  id: string | number;
  recordId: string;       
  moduleKey: string;     
  actionType: AuditActionType;
  
  // Field-level details for simple edits
  field?: string;
  oldValue?: string;
  newValue?: string;
  
  // JSON structure for multiple field changes (from Django AuditLog.changes)
  changes?: Record<string, { old: any; new: any }>;

  user: string;          // Maps to log.user.get_full_name
  role: string;          // Maps to log.user.role
  timestamp: string;
  reason?: string;
}

// --- SERVICE LOGIC ---
export const auditService = {
  /**
   * Fetches the real audit trail from the Django backend.
   * If the backend fails, it provides a "seed" entry to prevent UI crashes.
   */
  async list(moduleKey: string, recordId: string): Promise<AuditTrailEntry[]> {
    try {
      // API call to the 'history' action defined in your ViewSets
      const response = await api.get<AuditTrailEntry[]>(`/quality/${moduleKey}/${recordId}/history/`);
      
      // Ensure the returned data includes the frontend-required keys
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

  /**
   * Manual addition of audit entries (e.g., for frontend-only events).
   * In a live app, most entries are created automatically by the Backend perform_update.
   */
  async add(
    moduleKey: string,
    recordId: string,
    entry: Omit<AuditTrailEntry, "id" | "timestamp" | "recordId" | "moduleKey">
  ): Promise<AuditTrailEntry> {
    const payload = {
      ...entry,
      moduleKey,
      recordId,
      change_reason: entry.reason // Maps to the backend expectation
    };

    // We send this to the backend to ensure the log is permanent
    const response = await api.post<AuditTrailEntry>(`/quality/${moduleKey}/${recordId}/history/`, payload);
    return response.data;
  },

  /**
   * Internal helper for UI resilience
   */
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