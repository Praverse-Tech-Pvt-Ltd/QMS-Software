import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { UserRole } from "../../services/permission.service";
import { getAccessToken } from "../../services/tokenStore";
import { authService } from "../../services/auth.service";
import { getSelectedSite, setSelectedSite } from "../../services/siteStore";
import { sitesService, type Site } from "../../services/sites.service";

type RoleContextType = {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  siteId: string | null;
  setSiteId: (siteId: string | null) => void;
  sites: Site[];
  mustChangePassword: boolean;
  setMustChangePassword: (value: boolean) => void;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(
    () => (sessionStorage.getItem("qms_role") as UserRole | null)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [siteId, setSiteIdState] = useState<string | null>(() => getSelectedSite());
  const [sites, setSites] = useState<Site[]>([]);
  const [mustChangePassword, setMustChangePasswordState] = useState<boolean>(
    () => sessionStorage.getItem("qms_must_change_password") === "true"
  );

  const setMustChangePassword = (value: boolean) => {
    sessionStorage.setItem("qms_must_change_password", String(value));
    setMustChangePasswordState(value);
  };

  const setSiteId = (newSiteId: string | null) => {
    setSelectedSite(newSiteId);
    setSiteIdState(newSiteId);
  };

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
          sessionStorage.removeItem("qms_must_change_password");
          setRoleState(null);
          setMustChangePasswordState(false);
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
      sessionStorage.removeItem("qms_must_change_password");
      setMustChangePasswordState(false);
    }
    setRoleState(newRole);
  };

  // Authenticated = role set AND access token in memory
  const isAuthenticated = !!role && !!getAccessToken();

  // Load the site list once authenticated, to populate the nav selector.
  useEffect(() => {
    if (isAuthenticated) {
      sitesService.list().then(setSites).catch(() => setSites([]));
    } else {
      setSites([]);
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      role, setRole, isAuthenticated, isLoading, siteId, setSiteId, sites,
      mustChangePassword, setMustChangePassword,
    }),
    [role, isAuthenticated, isLoading, siteId, sites, mustChangePassword]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
