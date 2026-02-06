import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../app/providers/RoleProvider';
import { permissionService } from '../../services/permission.service';
// ✅ FIX 1: Import 'ModuleKey' instead of 'Resource'
import type { ModuleKey } from '../../types/permissions.types';

interface RequirePermissionProps {
  resource: ModuleKey; // ✅ FIX 1: Update type usage
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ resource, children }) => {
  const { role } = useRole();
  const location = useLocation();

  // ✅ FIX 2: Handle null role (User not logged in)
  if (!role) {
    // If no role exists, redirect to login (or access denied)
    // You might want to change this to "/login" depending on your routing
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  // Now 'role' is guaranteed to be a string (UserRole), so this call is safe
  const hasAccess = permissionService.can(role, resource, 'view');

  if (!hasAccess) {
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequirePermission;