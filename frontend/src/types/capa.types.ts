import type{ WorkflowMeta } from "./workflow.types";

export interface CapaRecord extends WorkflowMeta {
  title: string;
  source: string; // e.g., "Deviation DEV-042"
  
  // ✅ New Fields for List View
  initiator: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
  relatedTo: string; // e.g., "DEV-2024-098"

  // Detail fields
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  type: "Corrective" | "Preventive";
  targetDate: string;
  owner: string;
  description: string;
  rootCause: string;
  proposedPlan: string;
}