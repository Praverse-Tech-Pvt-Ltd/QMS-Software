import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Avatar,
  Button,
} from "@mui/material";
// Existing Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

// ✅ NEW ICONS for Task H
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"; // For Inbox
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"; // For Reports

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { ROLE_PERMISSIONS } from "../../config/permissions";
import type { ModuleKey } from "../../types/permissions.types";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  const canView = (module: ModuleKey) => {
    return ROLE_PERMISSIONS[role]?.[module]?.includes("view");
  };

  const [trainingOpen, setTrainingOpen] = useState(
    location.pathname.startsWith("/training"),
  );

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "white",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: "#1e40af",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            N
          </Box>
          <Box>
            <Typography fontWeight={900}>NexGen Pharma</Typography>
            <Typography variant="caption" sx={{ letterSpacing: 1 }}>
              QUALITY SYSTEMS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
        <List dense>
          {/* Dashboard */}
          {canView("dashboard") && (
            <ListItemButton
              selected={isActive("/")}
              onClick={() => navigate("/")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <DashboardOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          )}

          {/* ✅ NEW: My Inbox (Available to everyone) */}
          <ListItemButton
            selected={isActive("/tasks")}
            onClick={() => navigate("/tasks")}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <AssignmentOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="My Inbox" />
          </ListItemButton>

          {/* DMS */}
          {canView("dms") && (
            <ListItemButton
              selected={isActive("/dms")}
              onClick={() => navigate("/dms")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <DescriptionOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Document Management" />
            </ListItemButton>
          )}

          {/* Training */}
          {canView("training") && (
            <>
              <ListItemButton
                onClick={() => setTrainingOpen((v) => !v)}
                selected={isActive("/training")}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon>
                  <SchoolOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Training / LMS" />
                {trainingOpen ? (
                  <ExpandLessOutlinedIcon />
                ) : (
                  <ExpandMoreOutlinedIcon />
                )}
              </ListItemButton>

              <Collapse in={trainingOpen} timeout="auto" unmountOnExit>
                <List dense sx={{ pl: 4 }}>
                  <ListItemButton
                    selected={location.pathname === "/training"}
                    onClick={() => navigate("/training")}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemText primary="Training Records" />
                  </ListItemButton>

                  {canView("training_matrix") && (
                    <ListItemButton
                      selected={location.pathname.startsWith("/training/matrix")}
                      onClick={() => navigate("/training/matrix")}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemText primary="Training Matrix" />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
            </>
          )}

          {/* Deviations */}
          {canView("deviations") && (
            <ListItemButton
              selected={isActive("/deviations")}
              onClick={() => navigate("/deviations")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <ReportProblemOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Deviation / Incident" />
            </ListItemButton>
          )}

          {/* CAPA */}
          {canView("capa") && (
            <ListItemButton
              selected={isActive("/capa")}
              onClick={() => navigate("/capa")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <FactCheckOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="CAPA" />
            </ListItemButton>
          )}

          {/* Change Control */}
          {canView("change") && (
            <ListItemButton
              selected={isActive("/change-control")}
              onClick={() => navigate("/change-control")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <ChangeCircleOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Change Control" />
            </ListItemButton>
          )}

          {/* ✅ NEW: Reports (Available to everyone or restricted by role if needed) */}
          <ListItemButton
            selected={isActive("/reports")}
            onClick={() => navigate("/reports")}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <AssessmentOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Reports & Analytics" />
          </ListItemButton>

          <Divider sx={{ my: 2 }} />

          {/* Settings */}
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </List>
      </Box>

      {/* User Card */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(30,64,175,0.06)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Avatar sx={{ bgcolor: "#1e40af" }}>AP</Avatar>
            <Box>
              <Typography fontWeight={700}>Alexander Pierce</Typography>
              <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
                {role}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
            onClick={() => {
              localStorage.removeItem("qms_token");
              navigate("/login", { replace: true });
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}