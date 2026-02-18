import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
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
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"; 
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"; 

// --- Hooks & Config ---
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import { transitions, motion } from "../../theme/motion";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  // State for Training Accordion
  const [trainingOpen, setTrainingOpen] = useState(
    location.pathname.startsWith("/training"),
  );

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // Helper to safely check permissions
  const canView = (module: any) => role ? permissionService.can(role, module, 'view') : false;

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FAFBFC",
        borderRight: "1px solid #E9ECEF",
      }}
    >
      {/* --- 1. LOGO SECTION --- */}
      <Box sx={{ px: 2, py: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#6366F1",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 18,
              boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
            }}
          >
            N
          </Box>
          <Box>
            <Typography fontWeight={700} sx={{ lineHeight: 1.1, color: "#1A1D21", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
              NexGen Pharma
            </Typography>
            <Typography variant="caption" sx={{ letterSpacing: 0.5, color: "#858D96", fontWeight: 600, fontSize: "0.625rem" }}>
              QUALITY SYSTEMS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* --- 2. NAVIGATION --- */}
      <Box sx={{ flex: 1, px: 2, py: 1.5, overflowY: "auto" }}>
        <List dense sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          
          {/* Dashboard */}
          {canView('dashboard') && (
            <ListItemButton
              selected={isActive("/")}
              onClick={() => navigate("/")}
              sx={{ 
                borderRadius: 2,
                minHeight: 38,
                px: 2,
                py: 0.75,
                transition: transitions.sidebar.item,
                "&.Mui-selected": {
                  bgcolor: "#EEF2FF",
                  borderLeft: "3px solid #6366F1",
                },
                "&:hover": {
                  bgcolor: "#F3F4F6",
                  transform: `translateX(${motion.distance.micro}px)`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/") ? "#6366F1" : "#858D96" }}>
                <DashboardOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{ 
                  fontWeight: isActive("/") ? 600 : 400,
                  fontSize: "0.8125rem",
                  color: isActive("/") ? "#1A1D21" : "#5C6370",
                }} 
              />
            </ListItemButton>
          )}

          {/* My Tasks */}
          <ListItemButton
            selected={isActive("/tasks")}
            onClick={() => navigate("/tasks")}
            sx={{ 
              borderRadius: 2,
              minHeight: 38,
              px: 2,
              py: 0.75,
              "&.Mui-selected": {
                bgcolor: "#EEF2FF",
                borderLeft: "3px solid #6366F1",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: isActive("/tasks") ? "#6366F1" : "#858D96" }}>
              <AssignmentOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="My Tasks" 
              primaryTypographyProps={{ 
                fontWeight: isActive("/tasks") ? 600 : 400,
                fontSize: "0.8125rem",
              }} 
            />
          </ListItemButton>

          {/* DMS */}
          {canView('dms') && (
            <ListItemButton
              selected={isActive("/dms")}
              onClick={() => navigate("/dms")}
              sx={{ 
                borderRadius: 2,
                minHeight: 38,
                "&.Mui-selected": {
                  bgcolor: "#EEF2FF",
                  borderLeft: "3px solid #6366F1",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/dms") ? "#6366F1" : "#858D96" }}>
                <DescriptionOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Document Management" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}

          {/* Training Accordion */}
          {canView('training') && (
            <>
              <ListItemButton
                onClick={() => setTrainingOpen((v) => !v)}
                selected={isActive("/training")}
                sx={{ borderRadius: 2, minHeight: 38 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive("/training") ? "#6366F1" : "#858D96" }}>
                  <SchoolOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Training" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
                {trainingOpen ? <ExpandLessOutlinedIcon fontSize="small" /> : <ExpandMoreOutlinedIcon fontSize="small" />}
              </ListItemButton>

              <Collapse in={trainingOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 2 }}>
                  <ListItemButton
                    selected={location.pathname === "/training"}
                    onClick={() => navigate("/training")}
                    sx={{ borderRadius: 2, minHeight: 32 }}
                  >
                    <ListItemText primary="Training Records" primaryTypographyProps={{ fontSize: "0.75rem" }} />
                  </ListItemButton>
                  
                  {canView('training_matrix') && (
                    <ListItemButton
                      selected={location.pathname === "/training/matrix"}
                      onClick={() => navigate("/training/matrix")}
                      sx={{ borderRadius: 2, minHeight: 32 }}
                    >
                      <ListItemText primary="Training Matrix" primaryTypographyProps={{ fontSize: "0.75rem" }} />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
            </>
          )}

          {/* Deviations */}
          {canView('deviations') && (
            <ListItemButton
              selected={isActive("/deviations")}
              onClick={() => navigate("/deviations")}
              sx={{ 
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "#EEF2FF",
                  borderLeft: "3px solid #6366F1",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/deviations") ? "#6366F1" : "#858D96" }}>
                <ReportProblemOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Deviations" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}

          {/* CAPA */}
          {canView('capa') && (
            <ListItemButton
              selected={isActive("/capa")}
              onClick={() => navigate("/capa")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/capa") ? "#6366F1" : "#858D96" }}>
                <FactCheckOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="CAPA" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}

          {/* Change Control */}
          {canView('change') && (
            <ListItemButton
              selected={isActive("/change-control")}
              onClick={() => navigate("/change-control")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/change-control") ? "#6366F1" : "#858D96" }}>
                <ChangeCircleOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Change Control" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}

          {/* Reports */}
          {canView('reports') && (
            <ListItemButton
              selected={isActive("/reports")}
              onClick={() => navigate("/reports")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/reports") ? "#6366F1" : "#858D96" }}>
                <AssessmentOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Reports" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}

          <Divider sx={{ my: 1, borderColor: "#E9ECEF" }} />

          {/* Settings */}
          {canView('settings') && (
            <ListItemButton 
              selected={isActive("/settings")}
              onClick={() => navigate("/settings")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive("/settings") ? "#6366F1" : "#858D96" }}>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: "0.8125rem" }} />
            </ListItemButton>
          )}
        </List>
      </Box>
    </Box>
  );
}