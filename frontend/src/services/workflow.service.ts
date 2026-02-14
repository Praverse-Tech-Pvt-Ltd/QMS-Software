// ==========================================
// 🎯 CONSOLIDATED WORKFLOW ENGINE V2.2
// ==========================================

// --- 1. CORE TYPES ---
export type WorkflowModuleKey =
  | "dms"
  | "training"
  | "deviations"
  | "capa"
  | "change";

export type WorkflowStatus =
  // --- Common / Shared ---
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "CLOSED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "IN_PROGRESS"

  // --- DMS (Document Management) ---
  | "EFFECTIVE"
  | "OBSOLETE"
  | "SUPERSEDED"

  // --- Training ---
  | "ACTIVE"

  // --- Deviations ---
  | "SUBMITTED"
  | "INVESTIGATION"
  | "QA_REVIEW"
  | "OPEN"
  | "CAPA_REQUIRED"

  // --- CAPA ---
  | "PLANNING"
  | "IMPLEMENTATION"
  | "VERIFICATION"
  | "COMPLETED"
  | "VERIFIED"

  // --- Change Control ---
  | "EVALUATION"
  | "APPROVAL";

export type WorkflowAction =
  // --- Standard Actions ---
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "CLOSE"

  // --- DMS Specific ---
  | "PUBLISH"
  | "RETIRE"

  // --- Deviation & CAPA Specific ---
  | "START_INVESTIGATION"
  | "SUBMIT_RCA"
  | "VERIFY_EFFECTIVENESS";

export type SignatureMeaning =
  | "Review"
  | "Approval"
  | "Execution"
  | "Authorship";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Skipped";

export interface WorkflowApprovalEntry {
  id: string;
  action: WorkflowAction;
  statusAfter: WorkflowStatus;
  comment?: string;
  user: string;
  role: string;
  timestamp: string;
}

export interface SignatureEntry {
  id: string;
  meaning: SignatureMeaning;
  statusBefore: WorkflowStatus;
  statusAfter: WorkflowStatus;
  signedBy: string;
  role: string;
  timestamp: string;
  comment?: string;
}

export interface ApprovalRequest {
  id: string;
  userId: string;
  userName: string;
  role: string;
  stepName: string;
  assignedDate: string;
  dueDate?: string;
  status: ApprovalStatus;
  comment?: string;
  completedDate?: string;
}

export interface WorkflowMeta {
  id: string;
  moduleKey: WorkflowModuleKey;
  status: WorkflowStatus;
  approvalRequests: ApprovalRequest[];
  rejectionReason?: string;
  approvalsLog: WorkflowApprovalEntry[];
  signatureLog: SignatureEntry[];
  dueDate?: string;
}

// --- 2. ENGINE CONFIGURATION ---

interface StateTransition {
  from: WorkflowStatus[];
  to: WorkflowStatus;
  action: WorkflowAction;
  allowedRoles: string[];
}

const STATE_MACHINE: StateTransition[] = [
  // --- 1. DEVIATIONS ---
  { from: ["DRAFT"], to: "INVESTIGATION", action: "SUBMIT", allowedRoles: ["Admin", "QA", "Production"] },
  { from: ["INVESTIGATION"], to: "QA_REVIEW", action: "SUBMIT", allowedRoles: ["Admin", "QA"] },
  { from: ["QA_REVIEW"], to: "CLOSED", action: "CLOSE", allowedRoles: ["Admin", "QA"] },

  // --- 2. CAPA ---
  { from: ["PLANNING"], to: "PENDING", action: "SUBMIT", allowedRoles: ["Admin", "QA"] },
  { from: ["PENDING"], to: "IMPLEMENTATION", action: "APPROVE", allowedRoles: ["Admin", "QA"] }, 
  { from: ["IMPLEMENTATION"], to: "VERIFICATION", action: "SUBMIT_RCA", allowedRoles: ["Admin", "QA"] },
  { from: ["VERIFICATION"], to: "CLOSED", action: "CLOSE", allowedRoles: ["Admin", "QA"] },

  // --- 3. CHANGE CONTROL ---
  { from: ["DRAFT"], to: "EVALUATION", action: "SUBMIT", allowedRoles: ["Admin", "QA"] },
  { from: ["EVALUATION"], to: "APPROVAL", action: "APPROVE", allowedRoles: ["Admin", "QA"] },
  { from: ["APPROVAL"], to: "IMPLEMENTATION", action: "APPROVE", allowedRoles: ["Admin", "QA"] },
  { from: ["IMPLEMENTATION"], to: "CLOSED", action: "CLOSE", allowedRoles: ["Admin", "QA"] },

  // --- 4. DMS (Documents) ---
  { from: ["DRAFT"], to: "REVIEW", action: "SUBMIT", allowedRoles: ["Admin", "Author", "QA"] },
  { from: ["REVIEW"], to: "APPROVED", action: "APPROVE", allowedRoles: ["Admin", "QA"] },
  { from: ["APPROVED"], to: "EFFECTIVE", action: "PUBLISH", allowedRoles: ["Admin", "QA"] },

  // --- 5. TRAINING (New) ---
  // Using IN_PROGRESS here to fix your assignment error
  { from: ["DRAFT"], to: "ACTIVE", action: "PUBLISH", allowedRoles: ["Admin", "QA"] },
  { from: ["ACTIVE"], to: "OBSOLETE", action: "RETIRE", allowedRoles: ["Admin", "QA"] }
];

// --- 3. SERVICE IMPLEMENTATION ---

export class WorkflowEngine {
  private getKey = (moduleKey: WorkflowModuleKey) =>
    `qms_workflow_${moduleKey}`;
  private now = () => new Date().toISOString();

  private getMap(moduleKey: WorkflowModuleKey): Record<string, WorkflowMeta> {
    const data = localStorage.getItem(this.getKey(moduleKey));
    return data ? JSON.parse(data) : {};
  }

  private setMap(
    moduleKey: WorkflowModuleKey,
    map: Record<string, WorkflowMeta>,
  ) {
    localStorage.setItem(this.getKey(moduleKey), JSON.stringify(map));
  }

  getOrCreate(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
    const map = this.getMap(moduleKey);
    if (!map[id]) {
      map[id] = {
        id,
        moduleKey,
        status: "DRAFT",
        approvalRequests: [],
        approvalsLog: [],
        signatureLog: [],
      };
      this.setMap(moduleKey, map);
    }
    return map[id];
  }

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

    if (!transition)
      return { error: `Invalid action ${action} for status ${meta.status}` };
    if (
      !transition.allowedRoles.includes(actor.role) &&
      actor.role !== "Admin"
    ) {
      return { error: "Permission denied" };
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
          timestamp: this.now(),
        },
        ...meta.approvalsLog,
      ],
    };

    const map = this.getMap(moduleKey);
    map[id] = updated;
    this.setMap(moduleKey, map);
    return updated;
  }
}

export const workflowService = new WorkflowEngine();
