import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from "@mui/material";
import { useRole } from "../../app/providers/RoleProvider";
import { ROLE_PERMISSIONS } from "../../config/permissions";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function PermissionMatrix() {
  const { role } = useRole();
  const canView = role === "Admin" || role === "QA";

  const modules = ["dashboard", "dms", "training", "training_matrix", "deviations", "capa", "change", "settings", "reports"];
  const actions = ["view", "create", "edit", "delete", "approve", "close", "export"];
  const roles = ["Admin", "QA", "QC", "Production", "Warehouse", "Viewer"];

  if (!canView) {
    return (
      <Alert severity="error">
        You do not have permission to view the permission matrix.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Role & Permission Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System-wide access control configuration (Read-Only)
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Configuration Locked:</strong> Permission matrix is defined in system configuration and cannot be modified through UI.
      </Alert>

      {modules.map((module) => (
        <Box key={module} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textTransform: "capitalize" }}>
            {module.replace("_", " ")}
          </Typography>
          <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, width: "150px" }}>Role</TableCell>
                  {actions.map((action) => (
                    <TableCell key={action} align="center" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                      {action}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((roleItem) => {
                  const permissions = ROLE_PERMISSIONS[roleItem as keyof typeof ROLE_PERMISSIONS]?.[module as keyof typeof ROLE_PERMISSIONS.Admin] || [];
                  return (
                    <TableRow key={roleItem} hover>
                      <TableCell>
                        <Chip label={roleItem} size="small" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      {actions.map((action) => {
                        const hasPermission = (permissions as string[]).includes(action);
                        return (
                          <TableCell key={action} align="center">
                            {hasPermission ? (
                              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                            ) : (
                              <CancelIcon sx={{ color: "#e2e8f0", fontSize: 20 }} />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}
