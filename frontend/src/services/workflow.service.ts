import type {
  WorkflowAction,
  WorkflowMeta,
  WorkflowModuleKey,
  WorkflowStatus,
} from "../types/workflow.types";

// ================================
// 🎯 ENHANCED WORKFLOW ENGINE V2.1
// ================================

// Event System
type WorkflowEventType = 
  | "workflow.created" 
  | "workflow.transitioned" 
  | "workflow.signed" 
  | "workflow.error"
  | "workflow.validated";

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventType;
  timestamp: string;
  moduleKey: WorkflowModuleKey;
  recordId: string;
  payload: unknown;
}

// State Machine Configuration
interface StateTransition {
  from: WorkflowStatus[];
  to: WorkflowStatus;
  action: WorkflowAction;
  allowedRoles: string[]; // 🛡️ NEW: RBAC Support
  validate?: (meta: WorkflowMeta) => ValidationResult;
  onTransition?: (meta: WorkflowMeta) => void;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

// Advanced Storage Strategy
export interface StorageStrategy {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export class LocalStorageStrategy implements StorageStrategy {
  get(key: string) { return localStorage.getItem(key); }
  set(key: string, value: string) { localStorage.setItem(key, value); }
  remove(key: string) { localStorage.removeItem(key); }
}

export class MemoryStorageStrategy implements StorageStrategy {
  private cache = new Map<string, string>();
  get(key: string) { return this.cache.get(key) || null; }
  set(key: string, value: string) { this.cache.set(key, value); }
  remove(key: string) { this.cache.delete(key); }
}

// Utility Functions
const getKey = (moduleKey: WorkflowModuleKey) => `qms_workflow_${moduleKey}`;
const now = () => new Date().toISOString();

// State Machine Definition
// 🛡️ Added allowedRoles for security
const STATE_MACHINE: StateTransition[] = [
  { 
    from: ["Draft"], 
    to: "Review", 
    action: "SUBMIT", 
    allowedRoles: ["Admin", "Author", "QALead", "Manager"] 
  },
  { 
    from: ["Review"], 
    to: "Approved", 
    action: "APPROVE", 
    allowedRoles: ["Admin", "QALead", "Manager"] 
  },
  { 
    from: ["Review"], 
    to: "Rejected", 
    action: "REJECT", 
    allowedRoles: ["Admin", "QALead", "Manager"] 
  },
  { 
    from: ["Approved"], 
    to: "Effective", 
    action: "PUBLISH", 
    allowedRoles: ["Admin", "QALead"] 
  },
  { 
    from: ["Effective", "Approved"], 
    to: "Closed", 
    action: "CLOSE", 
    allowedRoles: ["Admin", "QALead"] 
  },
  { 
    from: ["Rejected"], 
    to: "Draft", 
    action: "SUBMIT", 
    allowedRoles: ["Admin", "Author"] 
  },
  { 
    from: ["Investigation"], 
    to: "Root Cause Analysis", 
    action: "SUBMIT_RCA", 
    allowedRoles: ["Admin", "Investigator", "QALead"] 
  },
  { 
    from: ["Implementation"], 
    to: "Verification", 
    action: "VERIFY_EFFECTIVENESS", 
    allowedRoles: ["Admin", "QALead"] 
  },
];

function seedMeta(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
  return {
    id,
    moduleKey,
    status: "Draft",
    dueDate: "",
    rejectionReason: undefined,
    approvalRequests: [],
    approvalsLog: [
      {
        id: crypto.randomUUID(),
        action: "SUBMIT" as WorkflowAction,
        statusAfter: "Draft",
        comment: "Record created",
        user: "System",
        role: "System",
        timestamp: now(),
      },
    ],
    signatureLog: [],
  };
}

// ================================
// 🚀 ENHANCED WORKFLOW SERVICE
// ================================

export class WorkflowEngine {
  private storage: StorageStrategy;
  private eventQueue: WorkflowEvent[] = [];
  private subscribers = new Map<WorkflowEventType, ((event: WorkflowEvent) => void)[]>();

  constructor(storage?: StorageStrategy) {
    this.storage = storage || new LocalStorageStrategy();
  }

  // --- Event System ---
  private emit(type: WorkflowEventType, moduleKey: WorkflowModuleKey, recordId: string, payload: unknown) {
    const event: WorkflowEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: now(),
      moduleKey,
      recordId,
      payload,
    };
    
    this.eventQueue.push(event);
    const handlers = this.subscribers.get(type) || [];
    handlers.forEach(handler => handler(event));
    
    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-100);
    }
  }

  on(eventType: WorkflowEventType, handler: (event: WorkflowEvent) => void) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
    
    return () => {
      const handlers = this.subscribers.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  getEvents(moduleKey?: WorkflowModuleKey, recordId?: string): WorkflowEvent[] {
    let events = [...this.eventQueue];
    if (moduleKey) events = events.filter(e => e.moduleKey === moduleKey);
    if (recordId) events = events.filter(e => e.recordId === recordId);
    return events;
  }

  // --- Storage Operations ---
  private getMap(moduleKey: WorkflowModuleKey): Record<string, WorkflowMeta> {
    const key = getKey(moduleKey);
    const data = this.storage.get(key);
    return data ? JSON.parse(data) : {};
  }

  private setMap(moduleKey: WorkflowModuleKey, map: Record<string, WorkflowMeta>) {
    const key = getKey(moduleKey);
    this.storage.set(key, JSON.stringify(map));
  }

  // --- Validation & Permission Checks ---
  private validateTransition(
    meta: WorkflowMeta,
    action: WorkflowAction,
    actorRole: string
  ): ValidationResult {
    const transition = STATE_MACHINE.find(
      t => t.action === action && t.from.includes(meta.status)
    );

    if (!transition) {
      return {
        valid: false,
        errors: [`Invalid transition: Cannot perform '${action}' from status '${meta.status}'`],
      };
    }

    // 🛡️ RBAC Check
    if (!transition.allowedRoles.includes(actorRole) && actorRole !== "Admin") {
      return {
        valid: false,
        errors: [`Permission denied: Role '${actorRole}' cannot perform '${action}'`],
      };
    }

    if (transition.validate) {
      return transition.validate(meta);
    }

    return { valid: true };
  }

  /**
   * Helper for UI: Returns actions the current user can perform
   */
  getAvailableActions(status: WorkflowStatus, role: string): WorkflowAction[] {
    return STATE_MACHINE
      .filter(t => t.from.includes(status) && (t.allowedRoles.includes(role) || role === "Admin"))
      .map(t => t.action);
  }

  canPerformAction(status: WorkflowStatus, action: WorkflowAction, role: string): boolean {
    const actions = this.getAvailableActions(status, role);
    return actions.includes(action);
  }

  // --- Core Methods ---
  getOrCreate(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
    const map = this.getMap(moduleKey);

    if (!map[id]) {
      map[id] = seedMeta(id, moduleKey);
      this.setMap(moduleKey, map);
      this.emit("workflow.created", moduleKey, id, map[id]);
    }

    return map[id];
  }

  updateMeta(id: string, moduleKey: WorkflowModuleKey, patch: Partial<WorkflowMeta>): WorkflowMeta {
    const map = this.getMap(moduleKey);
    const prev = map[id] ?? seedMeta(id, moduleKey);

    map[id] = { ...prev, ...patch };
    this.setMap(moduleKey, map);
    return map[id];
  }

  addSignature(
    id: string,
    moduleKey: WorkflowModuleKey,
    entry: {
      meaning: "Review" | "Approval" | "Execution";
      statusBefore: WorkflowStatus;
      statusAfter: WorkflowStatus;
      signedBy: string;
      role: string;
      comment?: string;
    }
  ): WorkflowMeta {
    const meta = this.getOrCreate(id, moduleKey);

    const signature = {
      id: crypto.randomUUID(),
      meaning: entry.meaning,
      statusBefore: entry.statusBefore,
      statusAfter: entry.statusAfter,
      signedBy: entry.signedBy,
      role: entry.role,
      comment: entry.comment || "",
      timestamp: now(),
    };

    const updated: WorkflowMeta = {
      ...meta,
      signatureLog: [signature, ...meta.signatureLog],
    };

    this.emit("workflow.signed", moduleKey, id, signature);
    return this.updateMeta(id, moduleKey, updated);
  }

  transition(
    id: string,
    moduleKey: WorkflowModuleKey,
    action: WorkflowAction,
    actor: { user: string; role: string },
    comment?: string,
    rejectionReason?: string
  ): WorkflowMeta | { error: string; errors?: string[] } {
    try {
      const meta = this.getOrCreate(id, moduleKey);

      // Validate transition & permissions
      const validation = this.validateTransition(meta, action, actor.role);
      
      if (!validation.valid) {
        this.emit("workflow.error", moduleKey, id, { errors: validation.errors });
        return { error: "Validation failed", errors: validation.errors };
      }

      this.emit("workflow.validated", moduleKey, id, { action, currentStatus: meta.status });

      // Find target status
      const transition = STATE_MACHINE.find(
        t => t.action === action && t.from.includes(meta.status)
      )!;

      const statusAfter = transition.to;

      const logEntry = {
        id: crypto.randomUUID(),
        action,
        statusAfter,
        comment: comment || "",
        user: actor.user,
        role: actor.role,
        timestamp: now(),
      };

      const updated: WorkflowMeta = {
        ...meta,
        status: statusAfter,
        rejectionReason: action === "REJECT" ? rejectionReason : undefined, // Clear rejection reason if not rejecting
        approvalsLog: [logEntry, ...meta.approvalsLog],
      };

      // Execute transition hook (e.g., clear approvals, set due date)
      if (transition.onTransition) {
        transition.onTransition(updated);
      }

      this.emit("workflow.transitioned", moduleKey, id, {
        from: meta.status,
        to: statusAfter,
        action,
        actor,
      });

      return this.updateMeta(id, moduleKey, updated);
    } catch (error) {
      this.emit("workflow.error", moduleKey, id, { error: String(error) });
      return { error: "Transition failed", errors: [String(error)] };
    }
  }

  // --- Query Methods ---
  getAllByModule(moduleKey: WorkflowModuleKey): WorkflowMeta[] {
    const map = this.getMap(moduleKey);
    return Object.values(map);
  }

  getByStatus(moduleKey: WorkflowModuleKey, status: WorkflowStatus): WorkflowMeta[] {
    return this.getAllByModule(moduleKey).filter(m => m.status === status);
  }

  getPendingApprovals(moduleKey: WorkflowModuleKey, user: string): WorkflowMeta[] {
    return this.getAllByModule(moduleKey).filter(
      m => m.status === "Review" && m.approvalRequests.some(r => r.userId === user && r.status === "Pending")
    );
  }

  // --- Bulk Operations (Optimized) ---
  bulkTransition(
    ids: string[],
    moduleKey: WorkflowModuleKey,
    action: WorkflowAction,
    actor: { user: string; role: string },
    comment?: string
  ): { success: WorkflowMeta[]; failed: { id: string; error: string }[] } {
    const success: WorkflowMeta[] = [];
    const failed: { id: string; error: string }[] = [];
    
    // Optimization: Read map ONCE
    const map = this.getMap(moduleKey);
    let mapDirty = false;

    ids.forEach(id => {
       // Helper function to simulate transition without re-reading map
       // Note: reusing core logic but adapted for memory efficiency
       try {
         const meta = map[id] || seedMeta(id, moduleKey);
         
         const validation = this.validateTransition(meta, action, actor.role);
         if (!validation.valid) {
           failed.push({ id, error: validation.errors?.join(", ") || "Invalid transition" });
           return;
         }

         const transition = STATE_MACHINE.find(t => t.action === action && t.from.includes(meta.status))!;
         
         // Update object in memory
         const statusAfter = transition.to;
         const updated = {
           ...meta,
           status: statusAfter,
           approvalsLog: [{
             id: crypto.randomUUID(),
             action,
             statusAfter,
             comment: comment || "Bulk action",
             user: actor.user,
             role: actor.role,
             timestamp: now(),
           }, ...meta.approvalsLog]
         };

         map[id] = updated;
         success.push(updated);
         mapDirty = true;

       } catch(e) {
         failed.push({ id, error: String(e) });
       }
    });

    // Optimization: Write map ONCE
    if (mapDirty) {
      this.setMap(moduleKey, map);
    }

    return { success, failed };
  }

  // --- Statistics ---
  getStats(moduleKey: WorkflowModuleKey) {
    const all = this.getAllByModule(moduleKey);
    
    return {
      total: all.length,
      byStatus: {
        Draft: all.filter(m => m.status === "Draft").length,
        Review: all.filter(m => m.status === "Review").length,
        Approved: all.filter(m => m.status === "Approved").length,
        Rejected: all.filter(m => m.status === "Rejected").length,
        Effective: all.filter(m => m.status === "Effective").length,
        Closed: all.filter(m => m.status === "Closed").length,
      },
      avgProcessingTime: this.calculateAvgTime(all),
    };
  }

  private calculateAvgTime(metas: WorkflowMeta[]): number {
    if (metas.length === 0) return 0;
    
    const times = metas
      .filter(m => m.approvalsLog.length >= 2)
      .map(m => {
        const first = m.approvalsLog[m.approvalsLog.length - 1].timestamp;
        const last = m.approvalsLog[0].timestamp;
        return new Date(last).getTime() - new Date(first).getTime();
      });

    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  // --- Debugging & Monitoring ---
  debug(moduleKey?: WorkflowModuleKey) {
    console.group("🔍 Workflow Debug Info");
    
    if (moduleKey) {
      console.log(`Module: ${moduleKey}`);
      console.table(this.getAllByModule(moduleKey));
      console.log("Stats:", this.getStats(moduleKey));
    } else {
      console.log("Recent Events:", this.eventQueue.slice(-10));
    }
    
    console.groupEnd();
  }

  // Clear data (for testing)
  clear(moduleKey?: WorkflowModuleKey) {
    if (moduleKey) {
      this.storage.remove(getKey(moduleKey));
    } else {
      ["dms", "deviation", "capa", "training", "change"].forEach(key => {
        this.storage.remove(getKey(key as WorkflowModuleKey));
      });
    }
    this.eventQueue = [];
  }
}

// Export singleton instance
export const workflowService = new WorkflowEngine();