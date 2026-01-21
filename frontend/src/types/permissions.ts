import type { UserRole } from "./role";

export type ModuleKey = "dashboard" | "dms" | "training" | "deviations" | "capa" | "change";

export const rolePermissions: Record<UserRole, ModuleKey[]> = {
  Admin: ["dashboard", "dms", "training", "deviations", "capa", "change"],
  QA: ["dashboard", "dms", "training", "deviations", "capa", "change"],
  QC: ["dashboard", "dms", "training", "deviations", "capa"],
  Production: ["dashboard", "training", "deviations", "change"],
  Warehouse: ["dashboard", "training", "deviations"],
};
