import type { DeviationRecord } from "../services/deviations.service";

export const deviationsMock: DeviationRecord[] = [
  {
    id: "DEV-2024-098",
    title: "Out of Specification Result - Tablet Hardness Test",
    reportedBy: "John Martinez",
    department: "Quality Control",
    severity: "Major",
    status: "Review", // Maps to "QA Review"
    reportedDate: "2026-01-20",
    moduleKey: "deviations",
    
    // Details
    type: "OOS",
    description: "Hardness test failed for batch #402.",
    location: "Lab 3",
    immediateAction: "Quarantined batch.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "DEV-2024-099",
    title: "Temperature Excursion in Cold Storage Area",
    reportedBy: "Lisa Chen",
    department: "Warehouse",
    severity: "Critical",
    status: "Open",
    reportedDate: "2026-01-22",
    moduleKey: "deviations",

    type: "Environmental",
    description: "Temp spiked to 8°C for 4 hours.",
    location: "Cold Room B",
    immediateAction: "Moved stock to backup fridge.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "DEV-2024-097",
    title: "Documentation Error in Batch Manufacturing Record",
    reportedBy: "Michael Davis",
    department: "Production",
    severity: "Minor",
    status: "Implementation", // Maps to "In Progress"
    reportedDate: "2026-01-18",
    moduleKey: "deviations",

    type: "Documentation",
    description: "Missing signature on step 4.",
    location: "Line 1",
    immediateAction: "Notified supervisor.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "DEV-2024-096",
    title: "Equipment Malfunction - Tablet Press Line 3",
    reportedBy: "Sarah Johnson",
    department: "Engineering",
    severity: "Major",
    status: "Closed",
    reportedDate: "2026-01-10",
    moduleKey: "deviations",

    type: "Equipment",
    description: "Press stopped mid-cycle.",
    location: "Production Floor",
    immediateAction: "Maintenance called.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "DEV-2024-100",
    title: "Contamination Found During Environmental Monitoring",
    reportedBy: "Robert Wilson",
    department: "Quality Assurance",
    severity: "Critical",
    status: "Review", // Maps to "QA Review"
    reportedDate: "2026-01-23",
    moduleKey: "deviations",

    type: "Contamination",
    description: "Mold detected in Zone B.",
    location: "Zone B",
    immediateAction: "Sanitization protocol initiated.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];