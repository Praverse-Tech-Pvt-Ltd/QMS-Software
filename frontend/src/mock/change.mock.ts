import type { QmsStatus } from "../types/qms";

export type ChangeRecord = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: QmsStatus;
  updatedAt: string;
};

export const changeMock: ChangeRecord[] = [
  {
    id: "CC-0031",
    title: "Change in vendor for packaging material",
    department: "QA",
    owner: "M. Shah",
    status: "In Review",
    updatedAt: "2026-01-21",
  },
  {
    id: "CC-0032",
    title: "Update SOP for sampling method",
    department: "QC",
    owner: "R. Mehta",
    status: "Draft",
    updatedAt: "2026-01-20",
  },
];
