import type { DeviationRecord } from "../services/deviations.service";
import type { CapaRecord } from "../services/capa.service";
import type { ChangeRecord } from "../services/change.service";

export const deviationsMock: DeviationRecord[] = [
  {
    id: 1, // ✅ Numeric for Service
    deviation_id: "DEV-2024-098", 
    title: "OOS Result - Tablet Hardness",
    department: "Quality Control",
    risk_level: "MAJOR",
    status: "INVESTIGATION",
    occurrence_date: "2026-02-10",
    created_at: "2026-02-10",
    moduleKey: "deviations",
    description: "Hardness test failed for batch #402.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];

export const capaMock: CapaRecord[] = [
  {
    id: 101, // ✅ Numeric for Service
    capa_id: "CAPA-2024-034",
    title: "Enhanced Hardness Testing Protocol",
    department: "Quality Control",
    priority: "High",
    status: "PLANNING",
    due_date: "2026-03-15",
    action_type: "CORRECTIVE",
    moduleKey: "capa",
    description: "Update protocol.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];

export const changeMock: ChangeRecord[] = [
  {
    id: 501, // ✅ Numeric for Service
    cc_id: "CC-2024-078",
    title: "Batch Size Increase - Phase 1",
    department: "Production",
    change_type: "PERMANENT",
    status: "EVALUATION",
    target_date: "2026-04-01",
    moduleKey: "change",
    description: "Scale up manufacturing.",
    justification: "Market demand increase.",
    approvalRequests: [],
    signatureLog: [],
    approvalsLog: []
  }
];