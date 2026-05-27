import type { TrainingPlan } from "../services/training.service";

export const trainingMock: TrainingPlan[] = [
  {
    id: 1045, // ✅ Numeric ID for Database PK
    title: "Good Documentation Practices (GDP) 2026",
    description: "Core compliance training on ALCOA+ principles and 21 CFR Part 11 requirements.",
    department: "Quality Assurance",
    trainer: "Compliance Officer",
    status: "ACTIVE", // From WorkflowStatus
    
    // ✅ Field Alignment: Matches TrainingPlan interface
    method: "Classroom",
    duration_minutes: 60,
    
    // UI & Workflow Helpers
    version: "v1.0",
    passScore: 80,
    objectives: "Ensure accurate, legible, and contemporaneous record keeping.",
    moduleKey: "training",
    
    // Analytics Helpers
    totalTrainees: 100,
    completionRate: 45,

    // Workflow Integration (Partial<WorkflowMeta>)
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: 1046,
    title: "Aseptic Processing and Gowning",
    description: "Hands-on training for Grade A/B cleanroom entry protocols.",
    department: "Production",
    trainer: "Microbiology Lead",
    status: "DRAFT",
    method: "Classroom",
    duration_minutes: 120,
    version: "v2.1",
    passScore: 100,
    objectives: "Achieve zero-contamination gowning proficiency.",
    moduleKey: "training",
    totalTrainees: 25,
    completionRate: 0,
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: 1047,
    title: "Annual Safety & Chemical Handling",
    description: "Mandatory annual safety refresher for laboratory and warehouse staff.",
    department: "Environmental Health & Safety",
    trainer: "Safety Manager",
    status: "PENDING",
    method: "Online",
    duration_minutes: 45,
    version: "v2026",
    passScore: 85,
    objectives: "Review SDS protocols and spill response.",
    moduleKey: "training",
    totalTrainees: 150,
    completionRate: 12,
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];