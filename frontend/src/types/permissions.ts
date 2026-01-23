import type { UserRole } from "./role";

export type ModuleKey =
  | "dashboard"
  | "dms"
  | "training"
  | "training_matrix"
  | "deviations"
  | "capa"
  | "change";

export const rolePermissions: Record<UserRole, ModuleKey[]> = {
  Admin: [
    "dashboard",
    "dms",
    "training",
    "training_matrix",
    "deviations",
    "capa",
    "change",
  ],
  QA: [
    "dashboard",
    "dms",
    "training",
    "training_matrix",
    "deviations",
    "capa",
    "change",
  ],
  QC: ["dashboard", "dms", "training", "training_matrix", "deviations", "capa"],
  Production: ["dashboard", "training", "deviations", "change"],
  Warehouse: ["dashboard", "training", "deviations"],
};
