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
  Button,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export default function UsersAndRoles() {
  const { role } = useRole();
  const canEdit = role === "Admin";
  const canView = role === "Admin" || role === "QA";

  const [users] = useState<User[]>([
    { id: "U001", name: "Alexander Pierce", email: "a.pierce@nexgenpharma.com", role: "Admin", status: "Active", lastLogin: "2026-02-05 09:45" },
    { id: "U002", name: "Sarah Johnson", email: "s.johnson@nexgenpharma.com", role: "QA", status: "Active", lastLogin: "2026-02-05 10:12" },
    { id: "U003", name: "Michael Chen", email: "m.chen@nexgenpharma.com", role: "QC", status: "Active", lastLogin: "2026-02-04 16:30" },
    { id: "U004", name: "Emily Rodriguez", email: "e.rodriguez@nexgenpharma.com", role: "Production", status: "Active", lastLogin: "2026-02-05 08:00" },
    { id: "U005", name: "David Kim", email: "d.kim@nexgenpharma.com", role: "Warehouse", status: "Active", lastLogin: "2026-02-05 07:15" },
    { id: "U006", name: "Jennifer Lee", email: "j.lee@nexgenpharma.com", role: "Viewer", status: "Inactive", lastLogin: "2026-01-28 14:20" },
  ]);

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "default";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: "#dc2626",
      QA: "#2563eb",
      QC: "#16a34a",
      Production: "#ea580c",
      Warehouse: "#7c3aed",
      Viewer: "#64748b",
    };
    return colors[role] || "#64748b";
  };

  if (!canView) {
    return (
      <Alert severity="error">
        You do not have permission to view user management.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <GroupIcon sx={{ fontSize: 32, color: "#6366f1" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Users & Roles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user accounts and role assignments
            </Typography>
          </Box>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Add User
          </Button>
        )}
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Read-Only Access:</strong> Only Administrators can add or modify users.
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
              {canEdit && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                  {user.id}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(user.role) + "20",
                      color: getRoleColor(user.role),
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    size="small"
                    color={getStatusColor(user.status) as any}
                    icon={user.status === "Active" ? <CheckCircleIcon /> : <BlockIcon />}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "0.875rem", color: "#64748b" }}>
                  {user.lastLogin}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit User">
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === "Active" ? "Deactivate" : "Activate"}>
                        <IconButton size="small" color={user.status === "Active" ? "error" : "success"}>
                          {user.status === "Active" ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <strong>Note:</strong> User role changes require supervisor approval and are subject to audit trail logging.
      </Alert>
    </Box>
  );
}
