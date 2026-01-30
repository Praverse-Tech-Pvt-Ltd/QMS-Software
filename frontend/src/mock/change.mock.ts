import type { ChangeRecord } from "../types/change.types";

export const changeMock: ChangeRecord[] = [
  {
    id: "CC-2024-001",
    title: "New Blender Installation",
    status: "Impact Assessment",
    moduleKey: "change", // ✅ Add this
    
    type: "Major",
    priority: "High",
    department: "Engineering",
    description: "Installation of a new high-speed blender.",
    owner: "Jane Engineer",
    targetDate: "2024-06-01",
    justification: "Current capacity insufficient.",
    
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: [] // ✅ Add this
  }
];