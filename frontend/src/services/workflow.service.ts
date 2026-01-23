import type {
  WorkflowAction,
  WorkflowMeta,
  WorkflowModuleKey,
  WorkflowStatus,
} from "../types/workflow.types";

const getKey = (moduleKey: WorkflowModuleKey) => `qms_workflow_${moduleKey}`;

const now = () => new Date().toISOString();

function seedMeta(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
  return {
    id,
    moduleKey,
    status: "Draft",
    reviewers: [],
    approvers: [],
    dueDate: "",
    approvalsLog: [
      {
        id: crypto.randomUUID(),
        action: "SUBMIT_QA_REVIEW",
        statusAfter: "Draft",
        comment: "Record created (mock).",
        user: "System",
        role: "System",
        timestamp: now(),
      },
      ],
    signatureLog: [],
  };
}

export const workflowService = {
  getOrCreate(id: string, moduleKey: WorkflowModuleKey): WorkflowMeta {
    const key = getKey(moduleKey);
    const map = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, WorkflowMeta>;

    if (!map[id]) {
      map[id] = seedMeta(id, moduleKey);
      localStorage.setItem(key, JSON.stringify(map));
    }

    return map[id];
  },

  updateMeta(id: string, moduleKey: WorkflowModuleKey, patch: Partial<WorkflowMeta>) {
    const key = getKey(moduleKey);
    const map = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, WorkflowMeta>;
    const prev = map[id] ?? seedMeta(id, moduleKey);

    map[id] = { ...prev, ...patch };
    localStorage.setItem(key, JSON.stringify(map));
    return map[id];
  },

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
    ) {
    const meta = this.getOrCreate(id, moduleKey);

    const updated = {
        ...meta,
        signatureLog: [
        {
            id: crypto.randomUUID(),
            meaning: entry.meaning,
            statusBefore: entry.statusBefore,
            statusAfter: entry.statusAfter,
            signedBy: entry.signedBy,
            role: entry.role,
            comment: entry.comment || "",
            timestamp: now(),
        },
        ...meta.signatureLog,
        ],
    };

    return this.updateMeta(id, moduleKey, updated);
    },

  transition(
    id: string,
    moduleKey: WorkflowModuleKey,
    action: WorkflowAction,
    actor: { user: string; role: string },
    comment?: string,
    rejectionReason?: string
  ) {
    const meta = this.getOrCreate(id, moduleKey);

    const statusAfter: WorkflowStatus = (() => {
      switch (action) {
        case "SUBMIT_QA_REVIEW":
          return "QA Review";
        case "APPROVE":
          return "Approved";
        case "MARK_EFFECTIVE":
          return "Effective";
        case "CLOSE":
          return "Closed";
        case "REJECT":
          return "Rejected";
        default:
          return meta.status;
      }
    })();

    const updated: WorkflowMeta = {
      ...meta,
      status: statusAfter,
      rejectionReason: action === "REJECT" ? rejectionReason : meta.rejectionReason,
      approvalsLog: [
        {
          id: crypto.randomUUID(),
          action,
          statusAfter,
          comment: comment || "",
          user: actor.user,
          role: actor.role,
          timestamp: now(),
        },
        ...meta.approvalsLog,
      ],
    };

    return this.updateMeta(id, moduleKey, updated);
  },
};
