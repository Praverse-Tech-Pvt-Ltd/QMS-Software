import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { UserRole } from "../../services/permission.service";
import { getAccessToken } from "../../services/tokenStore";
import { authService } from "../../services/auth.service";

type RoleContextType = {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(
    () => (sessionStorage.getItem("qms_role") as UserRole | null)
  );
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if we have a role in sessionStorage but no access token in memory,
  // attempt a silent refresh via the HttpOnly refresh token cookie.
  useEffect(() => {
    const tryRestore = async () => {
      if (role && !getAccessToken()) {
        const ok = await authService.silentRefresh();
        if (!ok) {
          // Refresh failed — clear session
          sessionStorage.removeItem("qms_role");
          sessionStorage.removeItem("qms_user");
          setRoleState(null);
        }
      }
      setIsLoading(false);
    };
    tryRestore();
  }, []);

  const setRole = (newRole: UserRole | null) => {
    if (newRole) {
      sessionStorage.setItem("qms_role", newRole);
    } else {
      sessionStorage.removeItem("qms_role");
      sessionStorage.removeItem("qms_user");
    }
    setRoleState(newRole);
  };

  // Authenticated = role set AND access token in memory
  const isAuthenticated = !!role && !!getAccessToken();

  const value = useMemo(
    () => ({ role, setRole, isAuthenticated, isLoading }),
    [role, isAuthenticated, isLoading]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
