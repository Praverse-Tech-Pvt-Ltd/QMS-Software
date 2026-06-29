import type { WorkflowDefinition } from "../services/workflow.service";

export const WORKFLOWS: Record<string, WorkflowDefinition> = {
  dms: {
    label: "SOP Workflow",
    steps: [
      { id: "1", label: "Draft", status: "DRAFT", order: 1 },
      { id: "2", label: "Review", status: "REVIEW", order: 2 },
      { id: "3", label: "Approved", status: "APPROVED", order: 3 },
      { id: "4", label: "Effective", status: "EFFECTIVE", order: 4 },
    ],
    transitions: {
      DRAFT: [{ to: "REVIEW", label: "Submit for Review", action: "SUBMIT", requiredRole: ["Admin", "QA"], variant: "primary" }],
      REVIEW: [
        { to: "APPROVED", label: "Approve Document", action: "APPROVE", requiredRole: ["QA"], requiresEsig: true, variant: "success" },
        { to: "DRAFT", label: "Request Changes", action: "REJECT", requiredRole: ["QA"], requiresComment: true, variant: "error" },
      ],
      APPROVED: [{ to: "EFFECTIVE", label: "Publish", action: "PUBLISH", requiredRole: ["QA"], requiresEsig: true, variant: "primary" }],
    },
  },

  capa: {
    label: "CAPA Workflow",
    steps: [
      { id: "1", label: "Plan", status: "PLANNING", order: 1 },
      { id: "2", label: "Execution", status: "PENDING", order: 2 },
      { id: "3", label: "Verification", status: "VERIFICATION", order: 3 },
      { id: "4", label: "Closed", status: "CLOSED", order: 4 },
    ],
    transitions: {
      PLANNING: [{ to: "PENDING", label: "Approve Plan", action: "SUBMIT", requiredRole: ["QA", "QA Head", "QA Manager"], requiresEsig: true, variant: "primary" }],
      PENDING: [{ to: "VERIFICATION", label: "Complete Execution", action: "SUBMIT", requiredRole: ["Production", "QA", "QA Executive"], variant: "primary" }],
      VERIFICATION: [{ to: "CLOSED", label: "Verify & Close", action: "CLOSE", requiredRole: ["QA", "QA Head"], requiresEsig: true, variant: "success" }],
    },
  },

  deviations: {
    label: "Deviation Workflow",
    steps: [
      { id: "1", label: "Initiation", status: "DRAFT", order: 1 },
      { id: "2", label: "Investigation", status: "INVESTIGATION", order: 2 },
      { id: "3", label: "QA Review", status: "QA_REVIEW", order: 3 },
      { id: "4", label: "Closed", status: "CLOSED", order: 4 },
    ],
    transitions: {
      DRAFT: [{ to: "INVESTIGATION", label: "Submit Event", action: "SUBMIT", requiredRole: ["QA", "QA Executive"], variant: "primary" }],
      INVESTIGATION: [{ to: "QA_REVIEW", label: "Submit Investigation", action: "SUBMIT", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      QA_REVIEW: [{ to: "CLOSED", label: "Approve & Close", action: "CLOSE", requiredRole: ["QA", "QA Head"], requiresEsig: true, variant: "success" }],
    },
  },

  training: {
    label: "Training Plan",
    steps: [
      { id: "1", label: "Draft", status: "DRAFT", order: 1 },
      { id: "2", label: "Active", status: "ACTIVE", order: 2 },
    ],
    transitions: {
      DRAFT: [{ to: "ACTIVE", label: "Publish Plan", action: "PUBLISH", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
    },
  },

  change: {
    label: "Change Control",
    steps: [
      { id: "1", label: "Draft", status: "DRAFT", order: 1 },
      { id: "2", label: "Evaluation", status: "EVALUATION", order: 2 },
      { id: "3", label: "Approval", status: "APPROVAL", order: 3 },
      { id: "4", label: "Implementation", status: "IMPLEMENTATION", order: 4 },
      { id: "5", label: "QA Review", status: "QA_REVIEW", order: 5 },
      { id: "6", label: "Closed", status: "CLOSED", order: 6 },
    ],
    transitions: {
      DRAFT: [{ to: "EVALUATION", label: "Submit for Evaluation", action: "SUBMIT", requiredRole: ["QA", "QA Executive"], variant: "primary" }],
      EVALUATION: [{ to: "APPROVAL", label: "Submit for Approval", action: "SUBMIT", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      APPROVAL: [{ to: "IMPLEMENTATION", label: "Approve Implementation", action: "APPROVE", requiredRole: ["QA Head", "QA"], requiresEsig: true, variant: "success" }],
      IMPLEMENTATION: [{ to: "QA_REVIEW", label: "Submit for Closure", action: "SUBMIT", requiredRole: ["QA", "QA Executive"], variant: "primary" }],
      QA_REVIEW: [{ to: "CLOSED", label: "Close CC", action: "CLOSE", requiredRole: ["QA Head", "QA"], requiresEsig: true, variant: "success" }],
    },
  },

  audits: {
    label: "Audit Workflow",
    steps: [
      { id: "1", label: "Planned", status: "planned", order: 1 },
      { id: "2", label: "In Progress", status: "in_progress", order: 2 },
      { id: "3", label: "Finding Review", status: "finding_review", order: 3 },
      { id: "4", label: "Closed", status: "closed", order: 4 },
    ],
    transitions: {
      planned: [{ to: "in_progress", label: "Start Audit", action: "in_progress", requiredRole: ["QA", "QA Manager", "QA Head"], variant: "primary" }],
      in_progress: [{ to: "finding_review", label: "Submit Findings", action: "finding_review", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      finding_review: [{ to: "closed", label: "Close Audit", action: "closed", requiredRole: ["QA Head", "QA Manager"], requiresEsig: true, variant: "success" }],
    },
  },

  complaints: {
    label: "Complaint Workflow",
    steps: [
      { id: "1", label: "Received", status: "received", order: 1 },
      { id: "2", label: "Under Investigation", status: "under_investigation", order: 2 },
      { id: "3", label: "QA Review", status: "qa_review", order: 3 },
      { id: "4", label: "Closed", status: "closed", order: 4 },
    ],
    transitions: {
      received: [{ to: "under_investigation", label: "Begin Investigation", action: "under_investigation", requiredRole: ["QA", "QA Executive"], variant: "primary" }],
      under_investigation: [{ to: "qa_review", label: "Submit for Review", action: "qa_review", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      qa_review: [{ to: "closed", label: "Close Complaint", action: "closed", requiredRole: ["QA Head", "QA Manager"], requiresEsig: true, variant: "success" }],
    },
  },

  risks: {
    label: "Risk Workflow",
    steps: [
      { id: "1", label: "Draft", status: "draft", order: 1 },
      { id: "2", label: "Under Review", status: "under_review", order: 2 },
      { id: "3", label: "Mitigated", status: "mitigated", order: 3 },
      { id: "4", label: "Closed", status: "closed", order: 4 },
    ],
    transitions: {
      draft: [{ to: "under_review", label: "Submit for Review", action: "under_review", requiredRole: ["QA", "QA Executive"], variant: "primary" }],
      under_review: [{ to: "mitigated", label: "Apply Mitigations", action: "mitigated", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      mitigated: [{ to: "closed", label: "Accept & Close", action: "closed", requiredRole: ["QA Head"], requiresEsig: true, variant: "success" }],
    },
  },

  suppliers: {
    label: "Supplier Qualification",
    steps: [
      { id: "1", label: "Pending", status: "pending", order: 1 },
      { id: "2", label: "Under Qualification", status: "under_qualification", order: 2 },
      { id: "3", label: "Approved", status: "approved", order: 3 },
      { id: "4", label: "Suspended", status: "suspended", order: 4 },
    ],
    transitions: {
      pending: [{ to: "under_qualification", label: "Start Qualification", action: "under_qualification", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      under_qualification: [
        { to: "approved", label: "Approve Supplier", action: "approved", requiredRole: ["QA Head", "QA Manager"], requiresEsig: true, variant: "success" },
        { to: "suspended", label: "Suspend", action: "suspended", requiredRole: ["QA Head"], requiresComment: true, variant: "error" },
      ],
      approved: [{ to: "suspended", label: "Suspend Supplier", action: "suspended", requiredRole: ["QA Head"], requiresEsig: true, variant: "error" }],
    },
  },

  nonconformance: {
    label: "NC Workflow",
    steps: [
      { id: "1", label: "Reported", status: "reported", order: 1 },
      { id: "2", label: "On Hold", status: "on_hold", order: 2 },
      { id: "3", label: "Under Review", status: "under_review", order: 3 },
      { id: "4", label: "Disposed", status: "disposed", order: 4 },
    ],
    transitions: {
      reported: [{ to: "under_review", label: "Begin Review", action: "under_review", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      under_review: [{ to: "disposed", label: "Dispose", action: "disposed", requiredRole: ["QA", "QA Manager"], requiresEsig: true, variant: "success" }],
    },
  },

  oos: {
    label: "OOS Workflow",
    steps: [
      { id: "1", label: "Initiated", status: "initiated", order: 1 },
      { id: "2", label: "Phase 1", status: "phase1", order: 2 },
      { id: "3", label: "Phase 2", status: "phase2", order: 3 },
      { id: "4", label: "Closed", status: "closed", order: 4 },
    ],
    transitions: {
      initiated: [{ to: "phase1", label: "Begin Phase 1", action: "phase1", requiredRole: ["QC", "QA"], variant: "primary" }],
      phase1: [{ to: "phase2", label: "Escalate to Phase 2", action: "phase2", requiredRole: ["QA", "QA Manager"], variant: "primary" }],
      phase2: [{ to: "closed", label: "Close OOS", action: "closed", requiredRole: ["QA Head", "QA Manager"], requiresEsig: true, variant: "success" }],
    },
  },

  batch_records: {
    label: "Batch Release",
    steps: [
      { id: "1", label: "In Progress", status: "in_progress", order: 1 },
      { id: "2", label: "QC Review", status: "qc_review", order: 2 },
      { id: "3", label: "QA Review", status: "qa_review", order: 3 },
      { id: "4", label: "Released", status: "released", order: 4 },
    ],
    transitions: {
      in_progress: [{ to: "qc_review", label: "Submit to QC", action: "qc_review", requiredRole: ["Production", "QA Executive"], variant: "primary" }],
      qc_review: [{ to: "qa_review", label: "QC Approved", action: "qa_review", requiredRole: ["QC", "QA"], requiresEsig: true, variant: "primary" }],
      qa_review: [{ to: "released", label: "Release Batch", action: "released", requiredRole: ["QA Head", "QA Manager"], requiresEsig: true, variant: "success" }],
    },
  },
};
