import type { DmsDocument } from "../services/dms.service";

export const dmsMock: DmsDocument[] = [
  {
    id: 1001, // ✅ Numeric for Service
    document_id: "SOP-QA-001",
    title: "SOP - Equipment Cleaning",
    doc_type: "SOP",
    department: "QA",
    owner: "M. Shah",
    status: "EFFECTIVE",
    updatedAt: "2026-02-10",
    created_at: "2026-01-01",
    version: "1.0",
    approvalRequests: [],
    signatureLog: []
  }
];