// ==========================================
// 🎯 CONSOLIDATED WORKFLOW ENGINE V2.2 (FIXED)
// ==========================================

export type WorkflowModuleKey =
  | "dms"
  | "training"
  | "deviations"
  | "capa"
  | "change";

export type WorkflowStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "CLOSED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "EFFECTIVE"
  | "OBSOLETE"
  | "SUPERSEDED"
  | "ACTIVE"
  | "INVESTIGATION"
  | "QA_REVIEW"
  | "VERIFICATION"
  | "EVALUATION"
  | "APPROVAL"
  | "IMPLEMENTATION"
  | "PLANNING";

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStatus;
  order: number;
}

export interface WorkflowTransition {
  to: WorkflowStatus;
  label: string;
  action: WorkflowAction; // Changed string to type for better safety
  requiredRole: string[];
  variant: "primary" | "success" | "error" | "warning" | "default";
  requiresEsig?: boolean;
  requiresComment?: boolean;
}

export interface WorkflowDefinition {
  label: string;
  steps: WorkflowStep[];
  transitions: Record<string, WorkflowTransition[]>;
}

export type WorkflowAction =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "CLOSE"
  | "PUBLISH"
  | "RETIRE"
  | "START_INVESTIGATION"
  | "SUBMIT_RCA"
  | "VERIFY_EFFECTIVENESS";

export interface WorkflowMeta {
  id: string;
  moduleKey: WorkflowModuleKey;
  status: WorkflowStatus;
  approvalRequests: any[];
  approvalsLog: any[];
  signatureLog: any[];
}

// ✅ STATE MACHINE: Now used by the transition logic
const STATE_MACHINE: {
  from: WorkflowStatus[];
  to: WorkflowStatus;
  action: WorkflowAction;
  allowedRoles: string[];
}[] = [
  {
    from: ["DRAFT"],
    to: "INVESTIGATION",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA", "Production"],
  },
  {
    from: ["INVESTIGATION"],
    to: "QA_REVIEW",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["QA_REVIEW"],
    to: "CLOSED",
    action: "CLOSE",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["DRAFT"],
    to: "REVIEW",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["REVIEW"],
    to: "APPROVED",
    action: "APPROVE",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["APPROVED"],
    to: "EFFECTIVE",
    action: "PUBLISH",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["DRAFT"],
    to: "ACTIVE",
    action: "PUBLISH",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["ACTIVE"],
    to: "OBSOLETE",
    action: "RETIRE",
    allowedRoles: ["Admin", "QA"],
  },
];

export class WorkflowEngine {
  private getKey = (moduleKey: WorkflowModuleKey) =>
    `qms_workflow_${moduleKey}`;

  getOrCreate(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
    const data = localStorage.getItem(this.getKey(moduleKey));
    const map = data ? JSON.parse(data) : {};
    if (!map[id]) {
      map[id] = {
        id,
        moduleKey,
        status: "DRAFT",
        approvalRequests: [],
        approvalsLog: [],
        signatureLog: [],
      };
      localStorage.setItem(this.getKey(moduleKey), JSON.stringify(map));
    }
    return map[id];
  }

  // ✅ TRANSITION LOGIC: Now uses id, moduleKey, action, and actor
  transition(
    id: string,
    moduleKey: WorkflowModuleKey,
    action: WorkflowAction,
    actor: { user: string; role: string },
    comment?: string,
  ): WorkflowMeta | { error: string } {
    const meta = this.getOrCreate(id, moduleKey);

    // 1. Find valid transition
    const transition = STATE_MACHINE.find(
      (t) => t.action === action && t.from.includes(meta.status),
    );

    if (!transition) {
      return {
        error: `Action "${action}" is not allowed for current status ${meta.status}`,
      };
    }

    // 2. Permission check
    if (
      !transition.allowedRoles.includes(actor.role) &&
      actor.role !== "Admin"
    ) {
      return {
        error: `Role ${actor.role} does not have permission to perform ${action}`,
      };
    }

    // 3. Perform transition
    const updated: WorkflowMeta = {
      ...meta,
      status: transition.to,
      approvalsLog: [
        {
          id: crypto.randomUUID(),
          action,
          statusAfter: transition.to,
          comment: comment || "",
          user: actor.user,
          role: actor.role,
          timestamp: new Date().toISOString(),
        },
        ...meta.approvalsLog,
      ],
    };

    const map = JSON.parse(
      localStorage.getItem(this.getKey(moduleKey)) || "{}",
    );
    map[id] = updated;
    localStorage.setItem(this.getKey(moduleKey), JSON.stringify(map));

    return updated;
  }
}

export const workflowService = new WorkflowEngine();
