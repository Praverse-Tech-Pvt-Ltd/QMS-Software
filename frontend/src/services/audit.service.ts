
// --- TYPES ---
export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "APPROVAL"
  | "REJECT"
  | "ATTACHMENT_ADD"
  | "FIELD_EDIT";

export interface AuditTrailEntry {
  id: string;
  recordId: string;
  moduleKey: string;
  actionType: AuditActionType;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  role: string;
  timestamp: string;
  reason?: string;
}

// --- SERVICE LOGIC ---
const getKey = (moduleKey: string, recordId: string) =>
  `qms_audit_${moduleKey}_${recordId}`;

const now = () => new Date().toISOString();

export const auditService = {
  seedIfEmpty(moduleKey: string, recordId: string): AuditTrailEntry[] {
    const key = getKey(moduleKey, recordId);
    const existing = localStorage.getItem(key);

    if (!existing) {
      const seed: AuditTrailEntry[] = [
        {
          id: crypto.randomUUID(),
          recordId,
          moduleKey,
          actionType: "CREATE",
          user: "System",
          role: "System",
          timestamp: now(),
          reason: "Record created (mock seed).",
        },
      ];
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    return JSON.parse(existing) as AuditTrailEntry[];
  },

  list(moduleKey: string, recordId: string): AuditTrailEntry[] {
    return this.seedIfEmpty(moduleKey, recordId);
  },

  add(
    moduleKey: string,
    recordId: string,
    entry: Omit<AuditTrailEntry, "id" | "timestamp" | "recordId" | "moduleKey">
  ) {
    const key = getKey(moduleKey, recordId);
    const list = this.seedIfEmpty(moduleKey, recordId);

    const newEntry: AuditTrailEntry = {
      id: crypto.randomUUID(),
      recordId,
      moduleKey,
      timestamp: now(),
      ...entry,
    };

    localStorage.setItem(key, JSON.stringify([newEntry, ...list]));
    return newEntry;
  },
};