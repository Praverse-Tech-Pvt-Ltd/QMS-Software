export const dashboardKPIs = [
  { label: "Documents Pending Review", value: 12 },
  { label: "Trainings Due", value: 7 },
  { label: "Open Deviations", value: 4 },
  { label: "CAPA In Progress", value: 3 },
  { label: "Changes Under QA Review", value: 2 },
];

export type TaskStatus = "Pending" | "In Progress" | "Overdue" | "Completed";

export type TaskItem = {
  id: string;
  title: string;
  module: "DMS" | "Training" | "Deviation" | "CAPA" | "Change Control";
  dueDate: string;
  status: TaskStatus;
};

export const myTasksMock: TaskItem[] = [
  {
    id: "TSK-001",
    title: "Review SOP: Cleaning Procedure",
    module: "DMS",
    dueDate: "2026-01-22",
    status: "Pending",
  },
  {
    id: "TSK-002",
    title: "Complete GMP Refresher Training",
    module: "Training",
    dueDate: "2026-01-21",
    status: "Overdue",
  },
  {
    id: "TSK-003",
    title: "Deviation Investigation Review",
    module: "Deviation",
    dueDate: "2026-01-23",
    status: "In Progress",
  },
  {
    id: "TSK-004",
    title: "CAPA Effectiveness Check",
    module: "CAPA",
    dueDate: "2026-01-24",
    status: "Pending",
  },
];
