export type ModuleKey = "dms" | "training" | "deviations" | "capa" | "change";

export type WorkflowStatus =
  | "Draft"
  | "Submitted"
  | "QA Review"
  | "Approved"
  | "Effective"
  | "Closed"
  | "Rejected";

export type WorkflowTransition = {
  from: WorkflowStatus;
  to: WorkflowStatus;
  action: "submit" | "approve" | "reject" | "close";
};

export const workflows: Record<
  ModuleKey,
  { label: string; steps: WorkflowStatus[] }
> = {
  dms: {
    label: "Document Workflow",
    steps: ["Draft", "In Review", "Approved", "Effective", "Closed"],
  },

  training: {
    label: "Training Workflow",
    steps: ["Draft", "In Review", "Approved", "Effective", "Closed"],
  },

  deviations: {
    label: "Deviation Workflow",
    steps: ["Draft", "In Review", "Investigation", "Approved", "Closed"],
  },

  capa: {
    label: "CAPA Workflow",
    steps: [
      "Draft",
      "In Review",
      "Approved",
      "Implemented",
      "Effectiveness Check",
      "Closed",
    ],
  },

  change: {
    label: "Change Control Workflow",
    steps: ["Draft", "In Review", "Approved", "Implemented", "Effective", "Closed"],
  },
};
