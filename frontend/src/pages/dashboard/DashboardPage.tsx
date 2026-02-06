import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Grid
} from "@mui/material";



import { useNavigate } from "react-router-dom";
import { motion, transitions, shadows, keyframes } from "../../theme/motion";
import { useState } from "react";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

// ✅ 1. Import Role & Permission Logic
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import type { ModuleKey } from "../../types/permissions.types";
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [permissionDenied, setPermissionDenied] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  // --- KPI & Task Data (Static for now) ---
  const kpis = [
    { label: "Pending Approvals", value: "12", change: "+2.1%", trend: "up" },
    { label: "Open Deviations", value: "08", change: "-5.4%", trend: "down" },
    {
      label: "Overdue Trainings",
      value: "05",
      change: "STEADY",
      trend: "neutral",
    },
    { label: "Active CAPAs", value: "14", change: "-3.2%", trend: "down" },
  ];

  const tasks = [
    {
      id: "TSK-2845",
      title: "Review and approve SOP-QA-2024-015 Manufacturing Process",
      status: "QA Review",
      priority: "High",
      due: "2026-01-25",
    },
    {
      id: "TSK-2842",
      title: "Complete CAPA investigation for batch deviation DEV-098",
      status: "In Progress",
      priority: "Critical",
      due: "2026-01-24",
    },
    {
      id: "TSK-2839",
      title: "Sign off training completion for GDP module",
      status: "Open",
      priority: "Medium",
      due: "2026-01-28",
    },
    {
      id: "TSK-2840",
      title: "Quarterly Audit Report Review",
      status: "Draft",
      priority: "Low",
      due: "2026-02-01",
    },
  ];

  const trendIcon = (trend: string) => {
    if (trend === "up")
      return <TrendingUpIcon fontSize="small" sx={{ color: "#16a34a" }} />;
    if (trend === "down")
      return <TrendingDownIcon fontSize="small" sx={{ color: "#dc2626" }} />;
    return <RemoveIcon fontSize="small" sx={{ color: "#9ca3af" }} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Medium":
        return "#6366F1";
      default:
        return "#4b5563";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "QA Review":
        return {
          bgcolor: "#eff6ff",
          color: "#1d4ed8",
          border: "1px solid #C7D2FE",
        };
      case "In Progress":
        return {
          bgcolor: "#f0fdf4",
          color: "#15803d",
          border: "1px solid #bbf7d0",
        };
      case "Open":
        return {
          bgcolor: "#f3f4f6",
          color: "#374151",
          border: "1px solid #e5e7eb",
        };
      case "Draft":
        return {
          bgcolor: "#fff7ed",
          color: "#c2410c",
          border: "1px solid #fed7aa",
        };
      default:
        return { bgcolor: "#f3f4f6", color: "#374151" };
    }
  };

  // ✅ 3. Define Actions with their required Module Permission
  const allActions = [
    {
      label: "New Doc",
      icon: <DescriptionOutlinedIcon fontSize="large" />,
      path: "/dms/new",
      module: "dms" as ModuleKey,
    },
    {
      label: "Deviation",
      icon: <ReportProblemOutlinedIcon fontSize="large" />,
      path: "/deviations/new",
      module: "deviations" as ModuleKey,
    },
    {
      label: "Log Training",
      icon: <SchoolOutlinedIcon fontSize="large" />,
      path: "/training/new",
      module: "training" as ModuleKey,
    },
    {
      label: "CAPA",
      icon: <FactCheckOutlinedIcon fontSize="large" />,
      path: "/capa/new",
      module: "capa" as ModuleKey,
    },
  ];

  // ✅ 4. Handler for quick action clicks with permission check
  const handleQuickActionClick = (action: typeof allActions[0]) => {
    // ✅ FIX: Handle nullable role
    if (!role) {
        setPermissionDenied({
            open: true,
            message: "You must be logged in to perform this action.",
        });
        return;
    }

    const hasPermission = permissionService.can(role, action.module, "create");
    
    if (!hasPermission) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to create ${action.label}. Your current role (${role}) does not allow this action.`,
      });
      return;
    }
    navigate(action.path);
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 1600, 
        mx: "auto",
        animation: "fadeInUp 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        ...keyframes.fadeInUp,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              mb: 0.5,
              letterSpacing: "-0.5px",
            }}
          >
            Quality Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitoring real-time compliance metrics for current cycle.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            sx={{
              bgcolor: "white",
              borderColor: "#e2e8f0",
              color: "#475569",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              transition: transitions.button.default,
              "&:hover": {
                borderColor: "#cbd5e0",
                bgcolor: "#f8fafc",
                transform: "translateY(-1px)",
                boxShadow: shadows.subtle,
              },
              "&:active": {
                transform: "translateY(0)",
                transition: transitions.button.press,
              },
            }}
          >
            This Month
          </Button>
          <Button
            variant="outlined"
            // ✅ FIX: Handle nullable role for disabled check
            disabled={!role || !permissionService.can(role, 'dashboard', 'export')}
            sx={{
              bgcolor: "white",
              borderColor: "#e2e8f0",
              color: "#475569",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              transition: transitions.button.default,
              "&:hover": {
                borderColor: "#cbd5e0",
                bgcolor: "#f8fafc",
                transform: "translateY(-1px)",
                boxShadow: shadows.subtle,
              },
              "&:active": {
                transform: "translateY(0)",
                transition: transitions.button.press,
              },
              "&:disabled": {
                bgcolor: "#f3f4f6",
                color: "#9ca3af",
              },
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: shadows.card,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: transitions.card.hover,
                animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} ${index * 50}ms both`,
                ...keyframes.fadeInUp,
                "&:hover": {
                  transform: `translateY(-${motion.distance.small}px)`,
                  boxShadow: shadows.cardHover,
                  borderColor: "#cbd5e0",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#64748b", mb: 2 }}
              >
                {kpi.label}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1 }}
                >
                  {kpi.value}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor:
                      kpi.trend === "up"
                        ? "#f0fdf4"
                        : kpi.trend === "down"
                          ? "#fef2f2"
                          : "#f3f4f6",
                    px: 1,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  {trendIcon(kpi.trend)}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color:
                        kpi.trend === "up"
                          ? "#16a34a"
                          : kpi.trend === "down"
                            ? "#dc2626"
                            : "#6b7280",
                    }}
                  >
                    {kpi.change}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* My Tasks Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: shadows.card,
              animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} 250ms both`,
              ...keyframes.fadeInUp,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                My Tasks
              </Typography>
              <Button
                size="small"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.5px",
                    }}
                  >
                    TASK ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.5px",
                    }}
                  >
                    DESCRIPTION
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.5px",
                    }}
                  >
                    STATUS
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.5px",
                    }}
                  >
                    PRIORITY
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: "0.5px",
                    }}
                  >
                    DUE DATE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{ 
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: "pointer",
                      transition: transitions.tableRow.hover,
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#334155",
                        fontSize: "0.85rem",
                      }}
                    >
                      {t.id}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={t.title}
                        sx={{ color: "#475569", fontSize: "0.85rem" }}
                      >
                        {t.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        sx={{
                          ...getStatusStyle(t.status),
                          fontWeight: 600,
                          borderRadius: 1.5,
                          height: 24,
                          fontSize: "0.75rem",
                          transition: transitions.status.change,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: getPriorityColor(t.priority),
                        fontSize: "0.8rem",
                      }}
                    >
                      {t.priority}
                    </TableCell>
                    <TableCell sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {t.due}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* RIGHT COL: Actions & Alerts */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* ✅ QUICK ACTIONS (FILTERED) - Hidden for Viewer */}
            {role !== "Viewer" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  boxShadow: shadows.card,
                  animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} 300ms both`,
                  ...keyframes.fadeInUp,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, mb: 3, color: "#0f172a" }}
                >
                  Quick Actions
                </Typography>

                <Grid container spacing={2}>
                  {allActions.map((action) => {
                    // ✅ FIX: Handle nullable role
                    const hasPermission = role ? permissionService.can(role, action.module, "create") : false;
                    
                    return (
                      <Grid size={6} key={action.label}>
                        <Button
                          variant="outlined"
                          onClick={() => handleQuickActionClick(action)}
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                            borderRadius: 3,
                            border: "1px solid #e2e8f0",
                            color: hasPermission ? "#475569" : "#9ca3af",
                            bgcolor: "#fff",
                            textTransform: "none",
                            boxShadow: shadows.subtle,
                            transition: transitions.button.default,
                            opacity: hasPermission ? 1 : 0.6,
                            "&:hover": {
                              bgcolor: "#f8fafc",
                              borderColor: hasPermission ? "#94a3b8" : "#e2e8f0",
                              color: hasPermission ? "#0f172a" : "#9ca3af",
                              transform: `translateY(-${motion.distance.small}px)`,
                              boxShadow: shadows.card,
                            },
                            "&:active": {
                              transform: `translateY(-${motion.distance.micro}px)`,
                              transition: transitions.button.press,
                            },
                          }}
                        >
                          {action.icon}
                          <Typography variant="body2" fontWeight={600}>
                            {action.label}
                          </Typography>
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            {/* System Alert & AI Assistant */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#fffbeb",
                border: "1px solid #fcd34d",
                animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} 350ms both`,
                ...keyframes.fadeInUp,
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <WarningAmberRoundedIcon
                  sx={{ color: "#d97706", fontSize: 28 }}
                />
                <Box>
                  <Typography
                    fontWeight={800}
                    color="#92400e"
                    variant="subtitle1"
                  >
                    System Alert
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#b45309", mt: 0.5, lineHeight: 1.5 }}
                  >
                    Quarterly audit scheduled for Feb 15, 2026. Ensure all
                    documents are current.
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                onClick={() => navigate("/capa")}
                sx={{
                  bgcolor: "#d97706",
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  boxShadow: "none",
                  transition: transitions.button.default,
                  "&:hover": { 
                    bgcolor: "#b45309", 
                    boxShadow: shadows.subtle,
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                    transition: transitions.button.press,
                  },
                }}
              >
                Review Audit Readiness
              </Button>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#F5F7FF",
                border: "1px solid #C7D2FE",
                position: "relative",
                overflow: "hidden",
                transition: transitions.card.hover,
                animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} 400ms both`,
                ...keyframes.fadeInUp,
                "&:hover": {
                  borderColor: "#818CF8",
                  boxShadow: shadows.card,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -2,
                  left: -2,
                  right: -2,
                  height: 3,
                  background: "linear-gradient(90deg, #6366F1 0%, #818CF8 100%)",
                  borderRadius: "4px 4px 0 0",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #C7D2FE",
                    }}
                  >
                    <AutoAwesomeOutlinedIcon
                      sx={{ color: "#6366F1", fontSize: 22 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={800}
                      sx={{
                        color: "#4F46E5",
                        fontSize: "1rem",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      AI Assistant
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#10b981",
                          display: "inline-block",
                          animation: "pulse 2s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                      Ready to help
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="AI"
                  size="small"
                  sx={{
                    bgcolor: "#6366F1",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#475569",
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                Ask about processes, documents, compliance, or get instant
                workflow assistance.
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything about QMS..."
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
                    transition: "all 0.2s ease",
                    "& fieldset": {
                      borderColor: "#e2e8f0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#818CF8",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366F1",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 1.5,
                    fontSize: "0.9rem",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { icon: "📋", text: "My tasks" },
                  { icon: "📄", text: "Documents" },
                  { icon: "⚡", text: "Quick help" },
                ].map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={`${suggestion.icon} ${suggestion.text}`}
                    size="small"
                    onClick={() => {}}
                    sx={{
                      bgcolor: "white",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#EEF2FF",
                        borderColor: "#818CF8",
                        color: "#4F46E5",
                        transform: "translateY(-1px)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Permission Denied Dialog */}
      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}