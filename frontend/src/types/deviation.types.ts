import type { WorkflowMeta } from "./workflow.types";

export interface DeviationRecord extends WorkflowMeta {
  title: string;
  // ✅ New Fields for List View
  severity: "Minor" | "Major" | "Critical";
  reportedBy: string;
  department: string;
  reportedDate: string;

  // Detail fields
  type: string;
  description: string;
  location: string;
  immediateAction: string;
  rootCause?: string;
}