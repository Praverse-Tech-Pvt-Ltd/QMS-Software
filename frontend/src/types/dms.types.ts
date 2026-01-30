import type {
  WorkflowStatus,
  ApprovalRequest,
  SignatureEntry,
} from "./workflow.types";

export interface DmsDocument {
  id: string;
  title: string;
  type: "SOP" | "Policy" | "Work Instruction" | "Form" | "Manual";
  status: WorkflowStatus;
  updatedAt: string;

  // ✅ ADD THESE FIELDS to fix the errors:
  version: string;
  department?: string;
  description?: string;
  owner?: string;
  effectiveDate?: string;
  nextReview?: string;

  // ✅ Workflow Integration
  approvalRequests?: ApprovalRequest[];
  signatureLog?: SignatureEntry[];
}
