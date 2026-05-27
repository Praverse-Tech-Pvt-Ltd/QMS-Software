import React, { createContext, useContext, useMemo, useState } from "react";
import type { UserRole } from "../../services/permission.service"; // ✅ Import UserRole type from service, not config

type RoleContextType = {
  role: UserRole | null; // ✅ Allow null (Logged Out)
  setRole: (role: UserRole | null) => void;
  isAuthenticated: boolean; // ✅ Helper to check login status
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("qms_role");
    return saved ? (saved as UserRole) : null; // ✅ Default to null if not saved
  });

  const setRole = (newRole: UserRole | null) => {
    if (newRole) {
      localStorage.setItem("qms_role", newRole);
    } else {
      localStorage.removeItem("qms_role");
      localStorage.removeItem("qms_token"); // Clear token too if role is cleared
    }
    setRoleState(newRole);
  };

  // Check if both Token AND Role exist
  const isAuthenticated = !!role && !!localStorage.getItem("qms_token");

  const value = useMemo(() => ({ role, setRole, isAuthenticated }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}