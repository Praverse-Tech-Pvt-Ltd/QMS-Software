import React, { createContext, useContext, useMemo, useState } from "react";
import type { UserRole } from "../../types/role";

type RoleContextType = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("qms_role");
    return (saved as UserRole) || "QA";
  });

  const setRole = (newRole: UserRole) => {
    localStorage.setItem("qms_role", newRole);
    setRoleState(newRole);
  };

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}

