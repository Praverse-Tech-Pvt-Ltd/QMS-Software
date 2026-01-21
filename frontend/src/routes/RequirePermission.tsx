import { Navigate } from "react-router-dom";
import { useRole } from "../app/providers/RoleProvider";
import { rolePermissions } from "../types/permissions";
import type { ModuleKey } from "../types/permissions";

export default function RequirePermission({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) {
  const { role } = useRole();

  const allowedModules = rolePermissions[role];

  if (!allowedModules.includes(moduleKey)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
