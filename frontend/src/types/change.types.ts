import type { WorkflowMeta } from "./workflow.types";

export interface ChangeRecord extends WorkflowMeta {
  title: string;
  type: "Major" | "Minor" | "Critical";
  priority: "Low" | "Medium" | "High";
  department: string;
  description: string;
  owner: string;
  targetDate: string;
  justification?: string;
}
