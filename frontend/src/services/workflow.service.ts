// ==========================================
// 🎯 CONSOLIDATED WORKFLOW ENGINE V2.3 (SYNCED)
// ==========================================

export type WorkflowModuleKey =
  | "dms"
  | "training"
  | "deviations"
  | "capa"
  | "change"
  | "audits"
  | "complaints"
  | "risks"
  | "suppliers"
  | "nonconformance"
  | "oos"
  | "batch_records";

export type WorkflowStatus = string;

export type SignatureMeaning =
  | "Review"
  | "Approval"
  | "Execution"
  | "Authorship"
  | "Verification"
  | "Technical Review";

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStatus;
  order: number;
}

export interface WorkflowDefinition {
  // ✅ Added 'export'
  label: string;
  steps: WorkflowStep[];
  transitions: Record<string, WorkflowTransition[]>;
}

export interface ApprovalRequest {
  id: string;
  user_id: number | string;
  username: string;
  role: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
}

export interface SignatureEntry {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  meaning: SignatureMeaning;
  comment?: string;
}

export interface WorkflowTransition {
  to: WorkflowStatus;
  label: string;
  action: WorkflowAction;
  requiredRole: string[];
  variant: "primary" | "success" | "error" | "warning" | "default";
  requiresEsig?: boolean;
  requiresComment?: boolean;
}

export type WorkflowAction = string;

export interface WorkflowMeta {
  id: string;
  moduleKey: WorkflowModuleKey;
  status: WorkflowStatus;
  approvalRequests: ApprovalRequest[]; // ✅ Fixed types
  approvalsLog: any[];
  signatureLog: SignatureEntry[]; // ✅ Fixed types
}

// ✅ SYNCED STATE MACHINE: Standardized for all modules
const STATE_MACHINE: {
  from: WorkflowStatus[];
  to: WorkflowStatus;
  action: WorkflowAction;
  allowedRoles: string[];
}[] = [
  // --- DMS / Documents ---
  {
    from: ["DRAFT"],
    to: "REVIEW",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA", "Production"],
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

  // --- Deviations ---
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

  // --- CAPA Flow ---
  {
    from: ["PLANNING"],
    to: "PENDING",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA", "Production"],
  },
  {
    from: ["PENDING"],
    to: "VERIFICATION",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["VERIFICATION"],
    to: "CLOSED",
    action: "CLOSE",
    allowedRoles: ["Admin", "QA"],
  },

  // --- Change Control Flow ---
  {
    from: ["EVALUATION"],
    to: "APPROVAL",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["APPROVAL"],
    to: "IMPLEMENTATION",
    action: "APPROVE",
    allowedRoles: ["Admin", "QA"],
  },
  {
    from: ["IMPLEMENTATION"],
    to: "QA_REVIEW",
    action: "SUBMIT",
    allowedRoles: ["Admin", "QA", "Production"],
  },
  {
    from: ["QA_REVIEW"],
    to: "CLOSED",
    action: "CLOSE",
    allowedRoles: ["Admin", "QA"],
  },

  // --- Global Rejections ---
  {
    from: ["REVIEW", "QA_REVIEW", "APPROVAL", "VERIFICATION", "INVESTIGATION"],
    to: "REJECTED",
    action: "REJECT",
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

  // ✅ TRANSITION: Now returns specific data for UI updates
  transition(
    id: string,
    moduleKey: WorkflowModuleKey,
    action: WorkflowAction,
    actor: { user: string; role: string },
    comment?: string,
  ): WorkflowMeta | { error: string } {
    const meta = this.getOrCreate(id, moduleKey);

    const transition = STATE_MACHINE.find(
      (t) => t.action === action && t.from.includes(meta.status),
    );

    if (!transition) {
      return {
        error: `Action "${action}" is not allowed for status ${meta.status}`,
      };
    }

    if (
      !transition.allowedRoles.includes(actor.role) &&
      actor.role !== "Admin"
    ) {
      return { error: `Role ${actor.role} is not authorized for this action.` };
    }

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

    this.save(id, moduleKey, updated);
    return updated;
  }

  // ✅ ADD SIGNATURE: Specifically for 21 CFR Part 11 compliance
  addSignature(
    id: string,
    moduleKey: WorkflowModuleKey,
    entry: Omit<SignatureEntry, "id" | "timestamp">,
  ): WorkflowMeta {
    const meta = this.getOrCreate(id, moduleKey);
    const newSignature: SignatureEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const updated = {
      ...meta,
      signatureLog: [newSignature, ...meta.signatureLog],
    };

    this.save(id, moduleKey, updated);
    return updated;
  }

  private save(id: string, moduleKey: WorkflowModuleKey, meta: WorkflowMeta) {
    const map = JSON.parse(
      localStorage.getItem(this.getKey(moduleKey)) || "{}",
    );
    map[id] = meta;
    localStorage.setItem(this.getKey(moduleKey), JSON.stringify(map));
  }
}

export const workflowService = new WorkflowEngine();
