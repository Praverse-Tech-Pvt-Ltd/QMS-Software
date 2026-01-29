import type { UserRole, ModuleKey, PermissionMatrix, PermissionAction } from "../types/permissions.types";

export const ROLE_PERMISSIONS: PermissionMatrix = {
  Admin: {
    dashboard: ["view"],
    dms: ["view", "create", "edit", "delete", "approve", "export"],
    training: ["view", "create", "edit", "delete", "export"],
    training_matrix: ["view", "export"],
    deviations: ["view", "create", "edit", "delete", "approve", "export"],
    capa: ["view", "create", "edit", "delete", "approve", "export"],
    change: ["view", "create", "edit", "delete", "approve", "export"],
  },
  QA: {
    dashboard: ["view"],
    dms: ["view", "create", "edit", "approve", "export"], // QA Approves Docs
    training: ["view", "create", "edit", "export"],
    training_matrix: ["view", "export"],
    deviations: ["view", "create", "edit", "approve", "export"], // QA Approves Deviations
    capa: ["view", "create", "edit", "approve", "export"],
    change: ["view", "create", "edit", "approve", "export"],
  },
  QC: {
    dashboard: ["view"],
    dms: ["view"], // QC typically reads SOPs, doesn't write them
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view", "create"], // QC can raise a deviation
    capa: ["view", "create"], // QC can raise a CAPA
  },
  Production: {
    dashboard: ["view"],
    dms: ["view"], // Read-only access to Effective SOPs
    training: ["view"],
    training_matrix: ["view"], // Check own training status
    deviations: ["view", "create"], // Production often raises deviations
    change: ["view"],
  },
  Warehouse: {
    dashboard: ["view"],
    dms: ["view"],
    training: ["view"],
    deviations: ["view", "create"],
  },
  Viewer: {
    dashboard: ["view"],
    dms: ["view"], // Viewers can only read
    training: ["view"],
    training_matrix: ["view"],
    deviations: ["view"],
    capa: ["view"],
    change: ["view"],
  },
};

/**
 * Helper to check permissions in your UI
 * Usage: if (hasPermission('QA', 'dms', 'approve')) { ... }
 */
export const hasPermission = (
  role: UserRole, 
  module: ModuleKey, 
  action: PermissionAction
): boolean => {
  const modulePerms = ROLE_PERMISSIONS[role]?.[module];
  return modulePerms ? modulePerms.includes(action) : false;
};