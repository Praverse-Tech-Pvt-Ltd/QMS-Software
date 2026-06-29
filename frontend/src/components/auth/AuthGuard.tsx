import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";
import { CircularProgress, Box } from "@mui/material";

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useRole();

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

  return <Outlet />;
}
