import type { TrainingPlan } from "../types/training.types";

export const trainingMock: TrainingPlan[] = [
  {
    id: "TRN-2024-045",
    title: "Good Documentation Practices (GDP)",
    assignedTo: "All Production Staff",
    department: "Production",
    status: "Implementation", // Maps to "In Progress"
    moduleKey: "training",
    dueDate: "2026-01-30",
    completionRate: 68,
    
    // Default detail fields
    method: "Classroom", duration: 60, passScore: 80, objectives: "GDP Standards", trainer: "QA Lead", version: "v1.0", totalTrainees: 20, approvalRequests: [], signatureLog: [], approvalsLog: []
  },
  {
    id: "TRN-2024-046",
    title: "Cleanroom Protocol & Gowning Procedures",
    assignedTo: "Manufacturing Team",
    department: "Quality Assurance",
    status: "Closed", // Maps to "Completed"
    moduleKey: "training",
    dueDate: "2026-01-20",
    completionRate: 100,

    method: "Classroom", duration: 90, passScore: 85, objectives: "Gowning steps", trainer: "Microbiologist", version: "v2.0", totalTrainees: 15, approvalRequests: [], signatureLog: [], approvalsLog: []
  },
  {
    id: "TRN-2024-047",
    title: "Deviation Investigation and CAPA Process",
    assignedTo: "QA Team",
    department: "Quality Assurance",
    status: "Draft", // Maps to "Open"
    moduleKey: "training",
    dueDate: "2026-02-05",
    completionRate: 0,

    method: "Read", duration: 45, passScore: 100, objectives: "Root cause analysis", trainer: "QA Manager", version: "v1.0", totalTrainees: 5, approvalRequests: [], signatureLog: [], approvalsLog: []
  },
  {
    id: "TRN-2024-048",
    title: "Equipment Calibration & Maintenance",
    assignedTo: "Engineering Team",
    department: "Engineering",
    status: "Implementation", // In Progress
    moduleKey: "training",
    dueDate: "2026-01-28",
    completionRate: 45,

    method: "Online", duration: 120, passScore: 75, objectives: "Calibration schedules", trainer: "Eng. Lead", version: "v1.0", totalTrainees: 8, approvalRequests: [], signatureLog: [], approvalsLog: []
  },
  {
    id: "TRN-2024-044",
    title: "Data Integrity in Pharmaceutical Manufacturing",
    assignedTo: "All Staff",
    department: "Quality Assurance",
    status: "Pending", // Overdue logic handles this in UI based on date
    moduleKey: "training",
    dueDate: "2026-01-22",
    completionRate: 30,

    method: "Classroom", duration: 60, passScore: 80, objectives: "ALCOA+ Principles", trainer: "Compliance Officer", version: "v3.0", totalTrainees: 50, approvalRequests: [], signatureLog: [], approvalsLog: []
  }
];