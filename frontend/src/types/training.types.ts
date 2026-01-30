import type { WorkflowMeta } from "./workflow.types";

export interface TrainingPlan extends WorkflowMeta {
  title: string;
  method: "Classroom" | "Online" | "Read";
  duration: number; // in minutes
  passScore: number; // percentage
  objectives: string;
  trainer: string;
  version: string;
  
  // Dashboard / Stats Data
  totalTrainees: number;
  completionRate: number;
}