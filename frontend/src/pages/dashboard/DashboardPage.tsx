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
  Grid,
  CircularProgress,
  Stack,
  // LinearProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";
import { shadows, transitions } from "../../theme/motion";
import { useState, useEffect } from "react";

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

import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import type { ModuleKey } from "../../services/permission.service";
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import { fetchDashboardStats, fetchMyTasks } from "../../services/api";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [permissionDenied, setPermissionDenied] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    quality: {
      deviations: { open: 0, overdue: 0 },
      capas: { open: 0, overdue: 0 },
      change_controls: { open: 0, overdue: 0 },
      department_hotspots: [] as { department: string; count: number }[],
    },
    user: {
      pending_training: 0,
      assigned_capas: 0,
      total_tasks: 0,
    },
  });

  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          fetchDashboardStats(),
          fetchMyTasks(),
        ]);
        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleTaskClick = (id: string, type: string) => {
    const pathMap: Record<string, string> = {
      CAPA: "capa",
      "Change Control": "change-control",
      Training: "training",
      Document: "dms",
      Deviation: "deviations",
    };
    navigate(`/${pathMap[type] || "tasks"}/${id}`);
  };

  const handleQuickAction = (
    path: string,
    module: ModuleKey,
    label: string,
  ) => {
    if (!role || !permissionService.can(role, module, "create")) {
      setPermissionDenied({
        open: true,
        message: `Your role (${role || "Guest"}) does not have permission to create a new ${label}.`,
      });
      return;
    }
    navigate(path);
  };

  const kpis = [
    {
      label: "My Pending Tasks",
      value: stats.user.total_tasks.toString().padStart(2, "0"),
      change: "Active",
      trend: "neutral",
    },
    {
      label: "Open Deviations",
      value: stats.quality.deviations.open.toString().padStart(2, "0"),
      change:
        stats.quality.deviations.overdue > 0
          ? `${stats.quality.deviations.overdue} OVERDUE`
          : "On Track",
      trend: stats.quality.deviations.overdue > 0 ? "down" : "up",
    },
    {
      label: "Pending Training",
      value: stats.user.pending_training.toString().padStart(2, "0"),
      change: stats.user.pending_training > 0 ? "Action Required" : "Compliant",
      trend: stats.user.pending_training > 0 ? "down" : "up",
    },
    {
      label: "Active CAPAs",
      value: stats.quality.capas.open.toString().padStart(2, "0"),
      change:
        stats.quality.capas.overdue > 0
          ? `${stats.quality.capas.overdue} OVERDUE`
          : "Clean",
      trend: stats.quality.capas.overdue > 0 ? "down" : "neutral",
    },
  ];

  const trendIcon = (trend: string) => {
    if (trend === "up")
      return <TrendingUpIcon fontSize="small" sx={{ color: "#16a34a" }} />;
    if (trend === "down")
      return <TrendingDownIcon fontSize="small" sx={{ color: "#dc2626" }} />;
    return <RemoveIcon fontSize="small" sx={{ color: "#9ca3af" }} />;
  };

  const allActions = [
    {
      label: "New Doc",
      icon: <DescriptionOutlinedIcon />,
      path: "/dms/new",
      module: "dms" as ModuleKey,
    },
    {
      label: "Deviation",
      icon: <ReportProblemOutlinedIcon />,
      path: "/deviations/new",
      module: "deviations" as ModuleKey,
    },
    {
      label: "Training",
      icon: <SchoolOutlinedIcon />,
      path: "/training/new",
      module: "training" as ModuleKey,
    },
    {
      label: "CAPA",
      icon: <FactCheckOutlinedIcon />,
      path: "/capa/new",
      module: "capa" as ModuleKey,
    },
  ];

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress />
      </Box>
    );

  // Calculate max hotspot count for the bar scale
  // const maxHotspot = Math.max(
  //   ...stats.quality.department_hotspots.map((h) => h.count),
  //   1,
  // );

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto", p: 2 }}>
      <Typography
        variant="h4"
        fontWeight={900}
        mb={4}
        color="text.primary"
        letterSpacing="-0.5px"
      >
        Quality Dashboard Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => {
          const isAlert =
            kpi.change.includes("OVERDUE") || kpi.change.includes("Action");
          return (
            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  boxShadow: shadows.card,
                  height: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {kpi.label}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    mt: 1.5,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    color={isAlert ? "error.main" : "text.primary"}
                  >
                    {kpi.value}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: isAlert ? "#fef2f2" : "#f1f5f9",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                    }}
                  >
                    {!isAlert && trendIcon(kpi.trend)}
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color={isAlert ? "error.main" : "text.secondary"}
                      sx={{ fontSize: "0.65rem" }}
                    >
                      {kpi.change}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Task Table */}
            <Paper
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: shadows.card,
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
                <Typography variant="h6" fontWeight={800}>
                  My Active Tasks
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate("/tasks")}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  View All
                </Button>
              </Box>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>
                      TYPE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>
                      TITLE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>
                      STATUS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTasks.map((t) => (
                    <TableRow
                      key={t.id}
                      hover
                      onClick={() => handleTaskClick(t.id, t.type)}
                      sx={{
                        cursor: "pointer",
                        transition: transitions.tableRow.hover,
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {t.id}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.type}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {t.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          size="small"
                          variant="outlined"
                          color={t.status === "OVERDUE" ? "error" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Departmental Hotspots - Horizontal Bar Chart */}
            {/* <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: shadows.card,
              }}
            >
              <Typography variant="h6" fontWeight={800} mb={3}>
                Departmental Hotspots (Open Issues)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {stats.quality.department_hotspots.map((item) => (
                  <Box key={item.department}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {item.department}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="primary.main"
                      >
                        {item.count} Records
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / maxHotspot) * 100}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          bgcolor: "#6366F1",
                        },
                      }}
                    />
                  </Box>
                ))}
                {stats.quality.department_hotspots.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    No departmental hotspots detected.
                  </Typography>
                )}
              </Box>
            </Paper> */}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: shadows.card,
              }}
            >
              <Typography variant="h6" fontWeight={800} mb={3}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {allActions.map((action) => (
                  <Grid size={{ xs: 6 }} key={action.label}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        handleQuickAction(
                          action.path,
                          action.module,
                          action.label,
                        )
                      }
                      sx={{
                        height: 110,
                        flexDirection: "column",
                        gap: 1.5,
                        borderRadius: 3,
                        textTransform: "none",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          bgcolor: "#f8fafc",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Box sx={{ color: "primary.main" }}>{action.icon}</Box>
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.primary"
                      >
                        {action.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* System Alert Panel */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#fffbeb",
                border: "1px solid #fcd34d",
              }}
            >
              <Box
                sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
              >
                <WarningAmberRoundedIcon sx={{ color: "#d97706" }} />
                <Typography
                  fontWeight={900}
                  color="#92400e"
                  variant="subtitle2"
                >
                  SYSTEM COMPLIANCE ALERT
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="#b45309"
                mb={3}
                lineHeight={1.6}
              >
                External Audit scheduled for **Feb 28, 2026**. Please ensure all
                pending training and effective documents are reviewed.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/dms")}
                sx={{
                  bgcolor: "#d97706",
                  fontWeight: 800,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#b45309", boxShadow: shadows.card },
                }}
              >
                Go to Document Center
              </Button>
            </Paper>

            {/* AI Assistant Panel */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#f5f3ff",
                border: "1px solid #ddd6fe",
                boxShadow: shadows.card,
              }}
            >
              <Box
                sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}
              >
                <AutoAwesomeOutlinedIcon sx={{ color: "#7c3aed" }} />
                <Typography
                  fontWeight={900}
                  color="#5b21b6"
                  variant="subtitle2"
                >
                  AI QUALITY ASSISTANT
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#10b981",
                    animation: `${pulse} 2s infinite`,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="#6d28d9"
                mb={2}
                sx={{ fontSize: "0.8rem" }}
              >
                "How many Major deviations are currently open in the Engineering
                department?"
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask AI about quality data..."
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}
