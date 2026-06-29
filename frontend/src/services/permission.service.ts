import { ROLE_PERMISSIONS } from "../config/permissions";

// --- TYPES FROM qms.ts ---

/**
 * ✅ NEW: Standardized UI Statuses
 * Exported to resolve "Module has no exported member 'QmsStatus'" error.
 */
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

// --- PERMISSION SPECIFIC TYPES ---

export type UserRole =
  | "Admin"
  | "QA Head"
  | "QA Manager"
  | "QA Executive"
  | "QA"
  | "QC"
  | "Production"
  | "Warehouse"
  | "Viewer";

export type ModuleKey =
  | "dashboard"
  | "dms"
  | "training"
  | "training_matrix"
  | "deviations"
  | "capa"
  | "change"
  | "settings"
  | "reports"
  | "audits"
  | "complaints"
  | "risks"
  | "suppliers"
  | "nonconformance"
  | "oos"
  | "laboratory"
  | "batch_records"
  | "knowledge";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "close"
  | "reopen";

export type PermissionMatrix = Partial<Record<
  UserRole,
  Partial<Record<ModuleKey, PermissionAction[]>>
>>;

// --- SERVICE LOGIC ---

class PermissionService {
  /**
   * Checks if a role has a specific permission on a resource.
   */
  can(role: UserRole, resource: ModuleKey, action: PermissionAction): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  }

  /**
   * Determine if a record should be locked (Read-Only)
   * Handles both Uppercase (Backend) and Title Case (UI) statuses.
   */
  getEditLockState(role: UserRole, module: ModuleKey, recordStatus?: string) {
    // 1. Check Role Permission
    if (!this.can(role, module, "edit")) {
      return {
        locked: true,
        reason: "You do not have permission to edit this record.",
      };
    }

    // 2. Check Record Status (Business Logic)
    const lockedStatuses = [
      "CLOSED",
      "APPROVED",
      "EFFECTIVE",
      "CANCELLED",
      "VERIFIED",
      "Closed",
      "Approved",
      "Effective",
    ];

    if (recordStatus && lockedStatuses.includes(recordStatus)) {
      const canReopen = this.can(role, module, "reopen");
      if (!canReopen) {
        return {
          locked: true,
          reason: `Record is ${recordStatus} and is locked for editing.`,
        };
      }
    }

    return { locked: false, reason: "" };
  }
}

export const permissionService = new PermissionService();

// --- CONSTANTS ---
export const roles: UserRole[] = [
  "Admin",
  "QA Head",
  "QA Manager",
  "QA Executive",
  "QA",
  "QC",
  "Production",
  "Warehouse",
  "Viewer",
];

export const departments: Department[] = [
  "QA",
  "QC",
  "Production",
  "Warehouse",
  "Engineering",
];
