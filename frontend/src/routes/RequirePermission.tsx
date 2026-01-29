import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../app/providers/RoleProvider"; 
import { ROLE_PERMISSIONS } from "../config/permissions"; 
import type { ModuleKey } from "../types/permissions.types";

export default function RequirePermission({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) {
  const { role } = useRole();
  const location = useLocation();

  // 1. Look up the role in the new Matrix
  const roleConfig = ROLE_PERMISSIONS[role];

  // 2. Check if this role has 'view' access to the requested module
  // logic: Permissions[Role][Module] includes 'view'
  const hasAccess = roleConfig?.[moduleKey]?.includes("view");

  if (!hasAccess) {
    // 3. Redirect to Access Denied (better UX than just sending home)
    // Pass the 'from' state so we can redirect them back if they login as a different user
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}