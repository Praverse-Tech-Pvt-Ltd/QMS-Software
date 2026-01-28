import type { Role, ModuleKey, ActionKey } from "../types/permissions.types";

type PermissionMatrix = {
  [R in Role]: {
    [M in ModuleKey]?: ActionKey[];
  };
};

export const PERMISSIONS: PermissionMatrix = {
  Admin: {
    dashboard: ["view"],
    dms: ["view", "create", "edit", "submit", "approve", "close", "reopen"],
    deviation: ["view", "create", "edit", "submit", "approve", "close"],
    capa: ["view", "create", "edit", "approve", "close"],
    change: ["view", "create", "edit", "approve", "close"],
    training: ["view", "create", "edit", "approve"],
  },

  QA: {
    dms: ["view", "approve"],
    deviation: ["view", "approve"],
    capa: ["view", "approve"],
    change: ["view", "approve"],
    training: ["view"],
  },

  QC: {
    dms: ["view"],
    deviation: ["view", "create"],
    capa: ["view"],
    training: ["view"],
  },

  Production: {
    dms: ["view"],
    deviation: ["view", "create"],
    training: ["view"],
  },

  Warehouse: {
    dms: ["view"],
    training: ["view"],
  },

  Viewer: {
    dashboard: ["view"],
    dms: ["view"],
  },
};

export function canPerform(
  role: Role,
  module: ModuleKey,
  action: ActionKey,
) {
  return PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}
