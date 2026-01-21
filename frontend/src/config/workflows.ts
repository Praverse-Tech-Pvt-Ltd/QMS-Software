export type ModuleKey = "dms" | "training" | "deviations" | "capa" | "change";

export type WorkflowStatus =
  | "Draft"
  | "In Review"
  | "Investigation"
  | "Approved"
  | "Effective"
  | "Implemented"
  | "Effectiveness Check"
  | "Closed"
  | "Rejected";

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
