import type { ChangeRecord } from "../types/change.types";

export const changeMock: ChangeRecord[] = [
  {
    id: "CC-2024-078",
    title: "Update Manufacturing Process Parameters for Batch Size Increase",
    initiator: "David Williams",
    department: "Production",
    changeType: "Major",
    status: "Review", // Maps to "QA Review"
    submittedDate: "2026-01-18",
    targetDate: "2026-03-01",
    moduleKey: "change",

    // Detail fields
    type: "Major",
    priority: "High",
    description: "Increase batch size from 100kg to 200kg.",
    owner: "Prod Manager",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CC-2024-079",
    title: "Equipment Replacement - HVAC System in Cleanroom Area",
    initiator: "Sarah Johnson",
    department: "Engineering",
    changeType: "Major",
    status: "Approved",
    submittedDate: "2026-01-15",
    targetDate: "2026-02-28",
    moduleKey: "change",

    type: "Major",
    priority: "High",
    description: "Replace AHU-01.",
    owner: "Eng Lead",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CC-2024-080",
    title: "SOP Revision - Environmental Monitoring Procedures",
    initiator: "Jennifer Lee",
    department: "Quality Assurance",
    changeType: "Minor",
    status: "Draft",
    submittedDate: "2026-01-22",
    targetDate: "2026-02-15",
    moduleKey: "change",

    type: "Minor",
    priority: "Low",
    description: "Update sampling points.",
    owner: "QA Specialist",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CC-2024-077",
    title: "Analytical Method Update for Impurity Testing",
    initiator: "Emily Rodriguez",
    department: "Quality Control",
    changeType: "Major",
    status: "Effective",
    submittedDate: "2026-01-05",
    targetDate: "2026-01-25",
    moduleKey: "change",

    type: "Major",
    priority: "High",
    description: "Update HPLC method.",
    owner: "QC Manager",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CC-2024-076",
    title: "Supplier Change for Packaging Materials",
    initiator: "Michael Chen",
    department: "Supply Chain",
    changeType: "Critical",
    status: "Implementation", // Maps to "In Progress"
    submittedDate: "2026-01-20",
    targetDate: "2026-02-20",
    moduleKey: "change",

    type: "Critical",
    priority: "High",
    description: "Switch to new foil supplier.",
    owner: "Supply Chain Lead",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];