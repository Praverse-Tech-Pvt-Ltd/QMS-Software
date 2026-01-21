import type { QmsStatus } from "../types/qms";

export type CapaRecord = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: QmsStatus;
  updatedAt: string;
};

export const capaMock: CapaRecord[] = [
  {
    id: "CAPA-0021",
    title: "Prevent recurrence of temperature excursion",
    department: "QA",
    owner: "QA Lead",
    status: "Approved",
    updatedAt: "2026-01-19",
  },
  {
    id: "CAPA-0022",
    title: "Corrective action for batch documentation gaps",
    department: "Production",
    owner: "P. Sharma",
    status: "In Review",
    updatedAt: "2026-01-18",
  },
];
