import type { QmsStatus } from "../types/qms";

export type DeviationRecord = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: QmsStatus;
  updatedAt: string;
};

export const deviationsMock: DeviationRecord[] = [
  {
    id: "DEV-0012",
    title: "Temperature excursion in storage area",
    department: "Warehouse",
    owner: "A. Patel",
    status: "In Review",
    updatedAt: "2026-01-21",
  },
  {
    id: "DEV-0013",
    title: "Label mismatch observed in line clearance",
    department: "Production",
    owner: "R. Mehta",
    status: "Draft",
    updatedAt: "2026-01-20",
  },
];
