import { ROLE_PERMISSIONS } from '../config/permissions';
import type { UserRole, ModuleKey, PermissionAction } from '../types/permissions.types';

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
   */
  getEditLockState(role: UserRole, module: ModuleKey, recordStatus?: string) {
    // 1. Check Role Permission
    if (!this.can(role, module, 'edit')) {
      return { locked: true, reason: "You do not have permission to edit this record." };
    }

    // 2. Check Record Status (Business Logic)
    if (recordStatus && ['Closed', 'Approved', 'Effective', 'Cancelled'].includes(recordStatus)) {
      const canReopen = this.can(role, module, 'reopen');
      if (!canReopen) {
         return { locked: true, reason: `Record is ${recordStatus} and cannot be edited.` };
      }
    }

    return { locked: false, reason: "" };
  }
}

export const permissionService = new PermissionService();