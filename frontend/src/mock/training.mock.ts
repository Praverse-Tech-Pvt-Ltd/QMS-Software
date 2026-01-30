import type { TrainingPlan } from "../types/training.types";

export const trainingMock: TrainingPlan[] = [
  {
    id: "TRN-2024-005",
    title: "Annual GMP Refresher",
    status: "Draft",
    moduleKey: "training",
    
    method: "Classroom",
    duration: 60,
    passScore: 80,
    objectives: "To refresh knowledge on Good Manufacturing Practices, hygiene, and documentation standards.",
    trainer: "John Doe (Training Lead)",
    version: "v2.0",
    
    totalTrainees: 25,
    completionRate: 85,
    
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];