import type{ WorkflowMeta } from "./workflow.types";

export interface ChangeRecord extends WorkflowMeta {
  title: string;
  // ✅ New Fields for List View
  initiator: string;
  department: string;
  changeType: "Major" | "Minor" | "Critical"; // Distinct from internal 'type'
  submittedDate: string;
  targetDate: string;

  // Detail fields
  priority: "Low" | "Medium" | "High";
  description: string;
  owner: string;
  justification?: string;
  
  // Keep strict typing for internal logic
  type: "Major" | "Minor" | "Critical"; 
}