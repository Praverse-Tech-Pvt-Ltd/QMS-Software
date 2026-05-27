import { type PermissionMatrix } from "../services/permission.service";

export const ROLE_PERMISSIONS: PermissionMatrix = {
  Admin: {
    dashboard: ["view", "export"],
    dms: ["view", "create", "edit", "delete", "approve"],
    training: ["view", "create", "edit", "delete"],
    training_matrix: ["view", "export"],
    deviations: ["view", "create", "edit", "delete", "approve", "close", "reopen"],
    capa: ["view", "create", "edit", "delete", "approve", "close"],
    change: ["view", "create", "edit", "delete", "approve", "close"],
    settings: ["view", "edit"],
    reports: ["view", "export"]
  },
  QA: {
    dashboard: ["view", "export"],
    dms: ["view", "create", "edit", "approve"],
    training: ["view", "create", "edit"],
    training_matrix: ["view"],
    deviations: ["view", "create", "edit", "approve", "close"],
    capa: ["view", "create", "edit", "approve", "close"],
    change: ["view", "create", "edit", "approve", "close"],
    settings: ["view"],
    reports: ["view", "export"]
  },
  QC: {
    dashboard: ["view"],
    dms: ["view", "create"],
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view", "create"],
    capa: ["view", "create"],
    change: ["view"],
    settings: ["view"],
    reports: ["view"]
  },
  Production: {
    dashboard: ["view"],
    dms: ["view"],
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view", "create"], // Can raise deviations
    capa: ["view"],
    change: ["view"],
    settings: [],
    reports: []
  },
  Warehouse: {
    dashboard: ["view"],
    dms: ["view"],
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view", "create"],
    capa: ["view"],
    change: ["view"],
    settings: [],
    reports: []
  },
  // ✅ This matches your Django default
  Viewer: {
    dashboard: ["view"],
    dms: ["view"],
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view"],
    capa: ["view"],
    change: ["view"],
    settings: [],
    reports: []
  }
};