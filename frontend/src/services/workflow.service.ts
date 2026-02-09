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
    // ✅ REMOVED 'reviewers' and 'approvers' if they aren't in your WorkflowMeta type
    dueDate: "",
    approvalRequests: [], // ✅ ADDED missing required field
    approvalsLog: [
      {
        id: crypto.randomUUID(),
        // ✅ CHANGED to a generic action likely in your types or cast it
        action: "SUBMIT" as WorkflowAction, 
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

    const updated: WorkflowMeta = {
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

    // ✅ LOGIC: Map your specific actions to statuses
    const statusAfter: WorkflowStatus = (() => {
      // Use explicit casting to string to compare safely if types mismatch
      const act = action as string;

      if (act === "SUBMIT" || act === "SUBMIT_QA_REVIEW") return "Review";
      if (act === "APPROVE") return "Approved";
      if (act === "MARK_EFFECTIVE" || act === "PUBLISH") return "Effective";
      if (act === "CLOSE") return "Closed";
      if (act === "REJECT") return "Rejected";
      
      return meta.status;
    })();

    const updated: WorkflowMeta = {
      ...meta,
      status: statusAfter,
      rejectionReason: (action as string) === "REJECT" ? rejectionReason : meta.rejectionReason,
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