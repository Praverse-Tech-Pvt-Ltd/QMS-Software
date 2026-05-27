export const dashboardKPIs = [
  { 
    label: "Documents Pending Review", 
    value: "12", 
    change: "+4.5%", 
    trend: "up" 
  },
  { 
    label: "Trainings Due", 
    value: "7", 
    change: "-2.1%", 
    trend: "down" 
  },
  { 
    label: "Open Deviations", 
    value: "4", 
    change: "STEADY", 
    trend: "neutral" 
  },
  { 
    label: "CAPA In Progress", 
    value: "3", 
    change: "+1.2%", 
    trend: "up" 
  },
];

export type TaskStatus = "Pending" | "In Progress" | "Overdue" | "Completed" | "QA Review" | "Open" | "Draft";

export type TaskItem = {
  id: string;
  title: string;
  module: "DMS" | "Training" | "Deviation" | "CAPA" | "Change Control";
  due: string; // Dashboard expects 'due', mapped from 'dueDate'
  status: TaskStatus;
  priority: "Low" | "Medium" | "High" | "Critical"; // Dashboard requires priority
};

export const myTasksMock: TaskItem[] = [
  {
    id: "TSK-001",
    title: "Review SOP: Cleaning Procedure",
    module: "DMS",
    due: "2026-01-22",
    status: "QA Review", // Mapped "Pending" to "QA Review" for UI color styling
    priority: "High",
  },
  {
    id: "TSK-002",
    title: "Complete GMP Refresher Training",
    module: "Training",
    due: "2026-01-21",
    status: "Open", // Mapped "Overdue" to "Open" (or handled via date logic)
    priority: "Medium",
  },
  {
    id: "TSK-003",
    title: "Deviation Investigation Review",
    module: "Deviation",
    due: "2026-01-23",
    status: "In Progress",
    priority: "Critical",
  },
  {
    id: "TSK-004",
    title: "CAPA Effectiveness Check",
    module: "CAPA",
    due: "2026-01-24",
    status: "Draft",
    priority: "Low",
  },
];