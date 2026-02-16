import type { CapaRecord } from "../services/capa.service";

export const capaMock: CapaRecord[] = [
  {
    id: "CAPA-2024-034",
    title: "Implement Enhanced Tablet Hardness Testing Protocol",
    initiator: "Sarah Johnson",
    department: "Quality Control",
    priority: "High",
    status: "IMPL", // Maps to "In Progress"
    dueDate: "2026-02-15",
    relatedTo: "DEV-2024-098",
    moduleKey: "capa",

    // Detail fields
    source: "Deviation",
    riskLevel: "High",
    type: "Corrective",
    targetDate: "2026-02-15",
    owner: "QC Lead",
    description: "Update hardness testing SOP.",
    rootCause: "Outdated protocol.",
    proposedPlan: "Revise SOP and retrain staff.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CAPA-2024-035",
    title: "Cold Storage Temperature Monitoring System Upgrade",
    initiator: "Lisa Chen",
    department: "Engineering",
    priority: "Critical",
    status: "Draft", // Maps to "Open"
    dueDate: "2026-02-10",
    relatedTo: "DEV-2024-099",
    moduleKey: "capa",

    source: "Deviation",
    riskLevel: "Critical",
    type: "Preventive",
    targetDate: "2026-02-10",
    owner: "Eng Manager",
    description: "Install new sensors.",
    rootCause: "Sensor failure.",
    proposedPlan: "Purchase and install IoT sensors.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CAPA-2024-033",
    title: "Training Program for Batch Record Documentation",
    initiator: "Michael Davis",
    department: "Quality Assurance",
    priority: "Medium",
    status: "Review", // Maps to "QA Review"
    dueDate: "2026-02-20",
    relatedTo: "DEV-2024-097",
    moduleKey: "capa",

    source: "Audit Finding",
    riskLevel: "Medium",
    type: "Corrective",
    targetDate: "2026-02-20",
    owner: "QA Trainer",
    description: "Retrain staff on GDP.",
    rootCause: "Lack of awareness.",
    proposedPlan: "Conduct workshop.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CAPA-2024-032",
    title: "Preventive Maintenance Schedule Review - Tablet Press",
    initiator: "Robert Wilson",
    department: "Engineering",
    priority: "High",
    status: "Closed", // Maps to "Completed"
    dueDate: "2026-01-25",
    relatedTo: "DEV-2024-096",
    moduleKey: "capa",

    source: "Maintenance Log",
    riskLevel: "High",
    type: "Preventive",
    targetDate: "2026-01-25",
    owner: "Maintenance Lead",
    description: "Review PM schedule.",
    rootCause: "Equipment wear.",
    proposedPlan: "Increase frequency of checks.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  },
  {
    id: "CAPA-2024-036",
    title: "Environmental Monitoring Frequency Increase",
    initiator: "Jennifer Lee",
    department: "Quality Assurance",
    priority: "Critical",
    status: "Implementation", // Maps to "In Progress"
    dueDate: "2026-02-05",
    relatedTo: "DEV-2024-100",
    moduleKey: "capa",

    source: "Environmental Trend",
    riskLevel: "Critical",
    type: "Preventive",
    targetDate: "2026-02-05",
    owner: "Microbiologist",
    description: "Increase sampling points.",
    rootCause: "Rising trends.",
    proposedPlan: "Update sampling plan.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];