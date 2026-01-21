import type { QmsStatus } from "../types/qms";

export type TrainingRecord = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: QmsStatus;
  updatedAt: string;
};

export const trainingMock: TrainingRecord[] = [
  {
    id: "TRN-0001",
    title: "GMP Refresher Training",
    department: "QA",
    owner: "QA Team",
    status: "Effective",
    updatedAt: "2026-01-20",
  },
  {
    id: "TRN-0002",
    title: "Warehouse Hygiene & Safety",
    department: "Warehouse",
    owner: "S. Kumar",
    status: "In Review",
    updatedAt: "2026-01-19",
  },
];
