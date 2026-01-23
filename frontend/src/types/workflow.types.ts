export type WorkflowStatus = "Draft" | "QA Review" | "Approved" | "Effective" | "Closed" | "Rejected";

export type WorkflowAction =
  | "SUBMIT_QA_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "MARK_EFFECTIVE"
  | "CLOSE";

export type WorkflowModuleKey = "dms" | "training" | "deviations" | "capa" | "change";

export type WorkflowApprovalEntry = {
  id: string;
  action: WorkflowAction;
  statusAfter: WorkflowStatus;
  comment?: string;
  user: string;
  role: string;
  timestamp: string;
};

export type SignatureMeaning = "Review" | "Approval" | "Execution";

export type SignatureEntry = {
  id: string;
  meaning: SignatureMeaning;
  statusBefore: WorkflowStatus;
  statusAfter: WorkflowStatus;
  signedBy: string;
  role: string;
  timestamp: string;
  comment?: string;
};

export type WorkflowMeta = {
  id: string;
  moduleKey: WorkflowModuleKey;
  status: WorkflowStatus;
  reviewers: string[];
  approvers: string[];
  dueDate?: string;
  rejectionReason?: string;
  approvalsLog: WorkflowApprovalEntry[];

  signatureLog: SignatureEntry[]; // ✅ add this
};


