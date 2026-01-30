import type { CapaRecord } from "../types/capa.types";

export const capaMock: CapaRecord[] = [
  {
    id: "CAPA-2024-009",
    title: "Labeling Error Correction",
    status: "Investigation",
    moduleKey: "capa",

    source: "Deviation DEV-042",
    riskLevel: "High",
    type: "Corrective",
    targetDate: "2024-03-01",
    owner: "QA Specialist",
    description:
      "Incorrect expiration date printed on Batch 4599 due to manual entry error.",
    rootCause:
      "Human error due to lack of double-check verification step in the SOP.",
    proposedPlan:
      "1. Update SOP-005 to include dual verification. 2. Retrain packaging staff.",

    approvalRequests: [],
    signatureLog: [],
    approvalsLog: [],
  },
];
