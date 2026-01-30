
import type { DmsDocument } from "../types/dms.types";

// ✅ 2. Update the data to match the interface
export const dmsMock: DmsDocument[] = [
  {
    id: "DMS-0001",
    title: "SOP - Equipment Cleaning Procedure",
    type: "SOP", // ✅ Added
    department: "QA", // Note: If your type definition doesn't have 'department', remove this or add it to the type
    owner: "M. Shah",
    status: "Review", // Must match WorkflowStatus ('In Review' -> 'Review')
    updatedAt: "2026-01-21",
    
    // ✅ Added Missing Fields
    version: "v1.2",
    description: "Standard cleaning procedure for mixing vessels.",
    effectiveDate: "",
    nextReview: "2027-01-21",
    approvalRequests: [],
    signatureLog: []
  },
  {
    id: "DMS-0002",
    title: "Batch Manufacturing Record Template",
    type: "Form", // ✅ Added
    department: "Production",
    owner: "A. Patel",
    status: "Draft",
    updatedAt: "2026-01-20",
    
    // ✅ Added Missing Fields
    version: "v0.1",
    description: "Template for recording batch production data.",
    effectiveDate: "",
    nextReview: "",
    approvalRequests: [],
    signatureLog: []
  },
  {
    id: "DMS-0003",
    title: "QC Sampling Plan",
    type: "Work Instruction", // ✅ Added
    department: "QC",
    owner: "R. Mehta",
    status: "Approved",
    updatedAt: "2026-01-18",
    
    // ✅ Added Missing Fields
    version: "v2.0",
    description: "Instructions for random sampling in the warehouse.",
    effectiveDate: "2026-02-01",
    nextReview: "2027-02-01",
    approvalRequests: [],
    signatureLog: []
  },
];