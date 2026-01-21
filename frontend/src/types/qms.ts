export type QmsStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Effective"
  | "Closed";

export const qmsStatuses: QmsStatus[] = [
  "Draft",
  "In Review",
  "Approved",
  "Effective",
  "Closed",
];

export type Department =
  | "QA"
  | "QC"
  | "Production"
  | "Warehouse"
  | "Engineering";

export const departments: Department[] = [
  "QA",
  "QC",
  "Production",
  "Warehouse",
  "Engineering",
];
