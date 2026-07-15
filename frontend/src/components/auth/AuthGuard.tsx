import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";
import { CircularProgress, Box } from "@mui/material";

export default function AuthGuard() {
  const { isAuthenticated, isLoading, mustChangePassword } = useRole();
  const location = useLocation();

  // Wait for silent refresh attempt before redirecting
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 21 CFR Part 11 section 11.300(b) — force a password change before anything else.
  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
