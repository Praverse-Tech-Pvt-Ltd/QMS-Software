import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../app/providers/RoleProvider"; 
import { ROLE_PERMISSIONS } from "../config/permissions"; 
import type { ModuleKey } from "../services/permission.service";

export default function RequirePermission({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) {
  const { role } = useRole();
  const location = useLocation();

  // ✅ FIX: Handle unauthenticated state (role is null)
  if (!role) {
    // Redirect to login if user is not logged in at all
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Look up the role in the Matrix
  // Now TypeScript knows 'role' is a valid key (string), not null
  const roleConfig = ROLE_PERMISSIONS[role];

  // 2. Check if this role has 'view' access to the requested module
  // logic: Permissions[Role][Module] includes 'view'
  // Optional chaining (?.) prevents crash if configuration is missing
  const hasAccess = roleConfig?.[moduleKey]?.includes("view");

  if (!hasAccess) {
    // 3. Redirect to Access Denied if logged in but unauthorized
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}