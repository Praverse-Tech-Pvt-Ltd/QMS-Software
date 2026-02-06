import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";

export default function AuthGuard() {
  const { isAuthenticated } = useRole();

  // If not logged in, kick them to Login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes (The Dashboard)
  return <Outlet />;
}