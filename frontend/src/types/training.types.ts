import type { WorkflowMeta } from "./workflow.types";

export interface TrainingPlan extends WorkflowMeta {
  title: string;
  // ✅ New Fields for List View
  assignedTo: string; 
  department: string;
  dueDate: string;
  completionRate: number; // 0-100

  // Detail fields
  method: "Classroom" | "Online" | "Read";
  duration: number;
  passScore: number;
  objectives: string;
  trainer: string;
  version: string;
  totalTrainees: number;
}