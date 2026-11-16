import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService, type ModuleKey } from "../../services/permission.service";
import { dmsService } from "../../services/dms.service";
import { color, transition } from "../../theme/tokens";

export const SIDEBAR_WIDTH = 248;

type NavLink = {
  label: string;
  path: string;
  icon: ReactNode;
  module?: ModuleKey; // omitted = visible to every signed-in user
  children?: { label: string; path: string; module?: ModuleKey }[];
};

type NavGroup = { title?: string; items: NavLink[] };

// Every routed module appears here exactly once (see routes/AppRouter.tsx).
const NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon />, module: "dashboard" },
      { label: "My Tasks", path: "/tasks", icon: <AssignmentOutlinedIcon /> },
    ],
  },
  {
    title: "Quality events",
    items: [
      { label: "Deviations", path: "/deviations", icon: <ReportProblemOutlinedIcon />, module: "deviations" },
      { label: "CAPA", path: "/capa", icon: <FactCheckOutlinedIcon />, module: "capa" },
      { label: "Change Control", path: "/change-control", icon: <ChangeCircleOutlinedIcon />, module: "change" },
      { label: "Non-Conformance", path: "/nonconformance", icon: <BlockOutlinedIcon />, module: "nonconformance" },
      { label: "Complaints", path: "/complaints", icon: <HeadsetMicOutlinedIcon />, module: "complaints" },
      { label: "OOS Investigations", path: "/oos", icon: <BiotechOutlinedIcon />, module: "oos" },
      { label: "Recall", path: "/recall", icon: <ReportGmailerrorredOutlinedIcon />, module: "recall" },
    ],
  },
  {
    title: "Lab & production",
    items: [
      { label: "Laboratory", path: "/laboratory", icon: <ScienceOutlinedIcon />, module: "laboratory" },
      { label: "Batch Records", path: "/batch-records", icon: <ChecklistOutlinedIcon />, module: "batch_records" },
      { label: "Stability", path: "/stability", icon: <TimelineOutlinedIcon />, module: "stability" },
      { label: "Environmental", path: "/environmental", icon: <AirOutlinedIcon />, module: "environmental" },
      { label: "Logbooks", path: "/logbooks", icon: <MenuBookOutlinedIcon />, module: "logbooks" },
    ],
  },
  {
    title: "Documents & training",
    items: [
      { label: "Documents", path: "/dms", icon: <DescriptionOutlinedIcon />, module: "dms" },
      {
        label: "Training",
        path: "/training",
        icon: <SchoolOutlinedIcon />,
        module: "training",
        children: [
          { label: "Training records", path: "/training" },
          { label: "Training matrix", path: "/training/matrix", module: "training_matrix" },
        ],
      },
      { label: "Knowledge Base", path: "/knowledge", icon: <AutoStoriesOutlinedIcon />, module: "knowledge" },
    ],
  },
  {
    title: "Oversight",
    items: [
      { label: "Audits", path: "/audits", icon: <GavelOutlinedIcon />, module: "audits" },
      { label: "Risk Register", path: "/risks", icon: <WarningAmberOutlinedIcon />, module: "risks" },
      { label: "Suppliers", path: "/suppliers", icon: <LocalShippingOutlinedIcon />, module: "suppliers" },
      { label: "Management Review", path: "/management-review", icon: <InsightsOutlinedIcon />, module: "reports" },
      { label: "Reports", path: "/reports", icon: <AssessmentOutlinedIcon />, module: "reports" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon />, module: "settings" },
      { label: "Sites", path: "/admin/sites", icon: <BusinessOutlinedIcon />, module: "site_management" },
    ],
  },
];

const itemSx = {
  minHeight: 32,
  px: 1.25,
  py: 0.5,
  mb: "1px",
  color: color.textSecondary,
  transition: transition(),
  "& .MuiListItemIcon-root": { minWidth: 28, color: color.textMuted, "& svg": { fontSize: 18 } },
  "&:hover": { backgroundColor: "rgba(24, 26, 32, 0.05)", color: color.ink },
  "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: color.accentSoft, color: color.accent },
  "&.Mui-selected .MuiListItemIcon-root": { color: color.accent },
} as const;

const labelProps = { fontSize: "0.8125rem", fontWeight: 500, color: "inherit", noWrap: true } as const;

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const canView = (module?: ModuleKey) => (module ? (role ? permissionService.can(role, module, "view") : false) : true);

  const [trainingOpen, setTrainingOpen] = useState(location.pathname.startsWith("/training"));

  // Review-due document count badge (Phase 6 Block 8)
  const [reviewDueCount, setReviewDueCount] = useState(0);
  useEffect(() => {
    if (canView("dms")) {
      dmsService.reviewDue().then((docs) => setReviewDueCount(docs.length)).catch(() => setReviewDueCount(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Box sx={{ width: SIDEBAR_WIDTH, height: "100%", display: "flex", flexDirection: "column", bgcolor: color.sidebar }}>
      <Box sx={{ px: 2, height: 56, display: "flex", alignItems: "center", gap: 1.25, borderBottom: `1px solid ${color.border}` }}>
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            borderRadius: "6px",
            bgcolor: color.accent,
            color: "#FFFFFF",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          N
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: color.ink, lineHeight: 1.2 }}>NexGen Pharma</Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: color.textMuted, lineHeight: 1.2 }}>Quality Management</Typography>
        </Box>
      </Box>

      <Box component="nav" aria-label="Main" sx={{ flex: 1, overflowY: "auto", px: 1, py: 1.5 }}>
        {NAV.map((group, gi) => {
          const items = group.items.filter((i) => canView(i.module));
          if (items.length === 0) return null;
          return (
            <Box key={group.title ?? gi} sx={{ mb: 1.5 }}>
              {group.title && (
                <Typography variant="overline" component="div" sx={{ px: 1.25, pb: 0.5, display: "block" }}>
                  {group.title}
                </Typography>
              )}
              <List disablePadding>
                {items.map((item) => {
                  if (item.children) {
                    const children = item.children.filter((c) => canView(c.module));
                    return (
                      <Box key={item.path}>
                        <ListItemButton
                          sx={itemSx}
                          selected={!trainingOpen && isActive(item.path)}
                          onClick={() => setTrainingOpen((v) => !v)}
                          aria-expanded={trainingOpen}
                        >
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} slotProps={{ primary: labelProps }} />
                          <ExpandMoreIcon
                            sx={{
                              fontSize: 18,
                              color: color.textMuted,
                              transform: trainingOpen ? "rotate(180deg)" : "none",
                              transition: transition(["transform"]),
                            }}
                          />
                        </ListItemButton>
                        <Collapse in={trainingOpen} timeout={150} unmountOnExit>
                          <List disablePadding>
                            {children.map((c) => (
                              <ListItemButton
                                key={c.path}
                                sx={{ ...itemSx, pl: 4.75 }}
                                selected={location.pathname === c.path}
                                onClick={() => go(c.path)}
                              >
                                <ListItemText primary={c.label} slotProps={{ primary: labelProps }} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    );
                  }
                  const badge = item.path === "/dms" && reviewDueCount > 0 ? reviewDueCount : null;
                  return (
                    <ListItemButton key={item.path} sx={itemSx} selected={isActive(item.path)} onClick={() => go(item.path)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} slotProps={{ primary: labelProps }} />
                      {badge !== null && (
                        <Box
                          component="span"
                          aria-label={`${badge} documents due for review`}
                          sx={{
                            ml: 1,
                            px: 0.75,
                            minWidth: 20,
                            height: 18,
                            borderRadius: "9px",
                            bgcolor: color.warningSoft,
                            color: color.warning,
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            display: "inline-grid",
                            placeItems: "center",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {badge > 99 ? "99+" : badge}
                        </Box>
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
