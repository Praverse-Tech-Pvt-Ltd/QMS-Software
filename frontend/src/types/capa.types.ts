import type { WorkflowMeta } from "./workflow.types";

export interface CapaRecord extends WorkflowMeta {
  title: string;
  source: string; // e.g., "Deviation DEV-042"
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  type: "Corrective" | "Preventive";
  targetDate: string;
  owner: string;
  description: string; // Problem Statement
  rootCause: string;
  proposedPlan: string;
}
