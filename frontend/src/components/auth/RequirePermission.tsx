import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../app/providers/RoleProvider'; // Assuming you have this provider
import { permissionService } from '../../services/permission.service';
import { Resource } from '../../types/permissions.types';

interface RequirePermissionProps {
  resource: Resource;
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ resource, children }) => {
  const { role } = useRole(); // Get current user role
  const location = useLocation();

  const hasAccess = permissionService.can(role, resource, 'view');

  if (!hasAccess) {
    // Redirect to Access Denied page, preserving the location they tried to access
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequirePermission;