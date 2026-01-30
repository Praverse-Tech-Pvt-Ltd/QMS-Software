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

// --- Icons ---
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
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"; 
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"; 
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// --- Hooks & Config ---
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service"; // ✅ IMPORT SERVICE

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole(); // ✅ Get dynamic role

  // State for Training Accordion
  const [trainingOpen, setTrainingOpen] = useState(
    location.pathname.startsWith("/training"),
  );

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("qms_token");
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "white",
      }}
    >
      {/* --- 1. LOGO SECTION --- */}
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "#1e40af",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 20,
              boxShadow: "0 4px 6px -1px rgba(30, 64, 175, 0.2)"
            }}
          >
            N
          </Box>
          <Box>
            <Typography fontWeight={900} sx={{ lineHeight: 1.1, color: "#0f172a", fontSize: "1rem" }}>
              NexGen Pharma
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: 0.5, color: "#64748b", fontWeight: 700, fontSize: "0.65rem" }}>
              QUALITY SYSTEMS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* --- 2. NAVIGATION --- */}
      <Box sx={{ flex: 1, px: 2, py: 3, overflowY: "auto" }}>
        <List dense sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          
          {/* Dashboard - Visible to Everyone */}
          {permissionService.can(role, 'dashboard', 'view') && (
            <ListItemButton
              selected={isActive("/")}
              onClick={() => navigate("/")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><DashboardOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          {/* Inbox - Visible to Everyone */}
          <ListItemButton
            selected={isActive("/tasks")}
            onClick={() => navigate("/tasks")}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon><AssignmentOutlinedIcon /></ListItemIcon>
            <ListItemText primary="My Inbox" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>

          {/* ✅ DMS - Protected */}
          {permissionService.can(role, 'dms', 'view') && (
            <ListItemButton
              selected={isActive("/dms")}
              onClick={() => navigate("/dms")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><DescriptionOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Document Management" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          {/* ✅ Training - Protected */}
          {permissionService.can(role, 'training', 'view') && (
            <>
              <ListItemButton
                onClick={() => setTrainingOpen((v) => !v)}
                selected={isActive("/training")}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon><SchoolOutlinedIcon /></ListItemIcon>
                <ListItemText primary="Training / LMS" primaryTypographyProps={{ fontWeight: 600 }} />
                {trainingOpen ? <ExpandLessOutlinedIcon fontSize="small" /> : <ExpandMoreOutlinedIcon fontSize="small" />}
              </ListItemButton>

              <Collapse in={trainingOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 2 }}>
                   <ListItemButton
                    selected={location.pathname === "/training"}
                    onClick={() => navigate("/training")}
                    sx={{ borderRadius: 2 }}
                  >
                     <ListItemText primary="Training Records" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
                  </ListItemButton>
                  
                  <ListItemButton
                    selected={location.pathname === "/training/matrix"}
                    onClick={() => navigate("/training/matrix")}
                    sx={{ borderRadius: 2 }}
                  >
                     <ListItemText primary="Training Matrix" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />
                  </ListItemButton>
                </List>
              </Collapse>
            </>
          )}

          {/* ✅ Deviations - Protected */}
          {permissionService.can(role, 'deviations', 'view') && (
            <ListItemButton
              selected={isActive("/deviations")}
              onClick={() => navigate("/deviations")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><ReportProblemOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Deviation / Incident" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          {/* ✅ CAPA - Protected */}
          {permissionService.can(role, 'capa', 'view') && (
            <ListItemButton
              selected={isActive("/capa")}
              onClick={() => navigate("/capa")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><FactCheckOutlinedIcon /></ListItemIcon>
              <ListItemText primary="CAPA" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          {/* ✅ Change Control - Protected */}
          {permissionService.can(role, 'change', 'view') && (
            <ListItemButton
              selected={isActive("/change-control")}
              onClick={() => navigate("/change-control")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><ChangeCircleOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Change Control" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          {/* ✅ Reports - Protected */}
          {permissionService.can(role, 'reports', 'view') && (
            <ListItemButton
              selected={isActive("/reports")}
              onClick={() => navigate("/reports")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><AssessmentOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Reports & Analytics" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

          {/* ✅ Settings - Protected */}
          {permissionService.can(role, 'settings', 'view') && (
            <ListItemButton 
              selected={isActive("/settings")}
              onClick={() => navigate("/settings")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><SettingsOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}

          

        </List>
      </Box>

      {/* --- 3. PROFILE CARD --- */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "#1e40af", width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>AP</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Alexander Pierce
              </Typography>
              <Typography variant="caption" color="#64748b" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                {role} {/* Shows current dynamic role */}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutOutlinedIcon />}
            size="small"
            sx={{ 
                textTransform: "none", 
                fontWeight: 600, 
                borderColor: "#cbd5e1",
                color: "#475569",
                bgcolor: "white",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8", color: "#1e293b" }
            }}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}