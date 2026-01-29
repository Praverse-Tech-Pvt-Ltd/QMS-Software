export type WorkflowModuleKey = "dms" | "training" | "deviations" | "capa" | "change";

export type WorkflowStatus =
  | "Draft"
  | "Submitted"         
  | "In Review"
  | "QA Review"
  | "Approved"
  | "Effective"
  | "Rejected"
  | "Closed"
  | "Obsolete"
  | "Investigation"      
  | "Root Cause Analysis"
  | "Implementation"     
  | "Effectiveness Check"
  | "Plan Approval"      
  | "Pending Assignment";


export type WorkflowAction =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "RETIRE"
  | "START_INVESTIGATION"
  | "SUBMIT_RCA"
  | "VERIFY_EFFECTIVENESS"
  | "CLOSE";

  export type SignatureMeaning = "Review" | "Approval" | "Execution" | "Authorship";
  
  export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Skipped";

export type WorkflowApprovalEntry = {
  id: string;
  action: WorkflowAction;
  statusAfter: WorkflowStatus;
  comment?: string;
  user: string;
  role: string;
  timestamp: string;
};

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
  approvalRequests: ApprovalRequest[];
  rejectionReason?: string;
  approvalsLog: WorkflowApprovalEntry[];
  signatureLog: SignatureEntry[];
  dueDate?: string;
};

export interface WorkflowTransition {
  to: WorkflowStatus;
  label: string;
  action: WorkflowAction;
  requiredRole: string[];
  requiresEsig?: boolean;
  requiresComment?: boolean;
  variant?: "primary" | "secondary" | "error" | "success";
}

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStatus;
  order: number;
}

export interface WorkflowDefinition {
  label: string;
  steps: WorkflowStep[];
  transitions: Partial<Record<WorkflowStatus, WorkflowTransition[]>>;
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