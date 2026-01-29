import { PERMISSIONS } from '../config/permissions';
import { Role, Resource, Action } from '../types/permissions.types';

class PermissionService {
  /**
   * Checks if a role has a specific permission on a resource.
   */
  can(role: Role, resource: Resource, action: Action): boolean {
    const rolePermissions = PERMISSIONS[role];
    
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource];
    
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  }

  /**
   * Checks if a user has access to a specific module route.
   */
  canAccessRoute(role: Role, path: string): boolean {
    // Map URL paths to Resources
    if (path.includes('/dms')) return this.can(role, 'dms', 'view');
    if (path.includes('/capa')) return this.can(role, 'capa', 'view');
    if (path.includes('/deviations')) return this.can(role, 'deviations', 'view');
    if (path.includes('/settings')) return this.can(role, 'settings', 'view');
    
    // Default allow for dashboard/home, default deny for unknown
    return path === '/' || path === '/dashboard';
  }
}

export const permissionService = new PermissionService();