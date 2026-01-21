import type { QmsStatus } from "../types/qms";

export type DmsDocument = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: QmsStatus;
  updatedAt: string;
};

export const dmsMock: DmsDocument[] = [
  {
    id: "DMS-0001",
    title: "SOP - Equipment Cleaning Procedure",
    department: "QA",
    owner: "M. Shah",
    status: "In Review",
    updatedAt: "2026-01-21",
  },
  {
    id: "DMS-0002",
    title: "Batch Manufacturing Record Template",
    department: "Production",
    owner: "A. Patel",
    status: "Draft",
    updatedAt: "2026-01-20",
  },
  {
    id: "DMS-0003",
    title: "QC Sampling Plan",
    department: "QC",
    owner: "R. Mehta",
    status: "Approved",
    updatedAt: "2026-01-18",
  },
];
