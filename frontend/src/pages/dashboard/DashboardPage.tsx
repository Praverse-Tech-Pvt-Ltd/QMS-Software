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
  Grid,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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

export default function DashboardPage() {
  const navigate = useNavigate();

  // ✅ 2. Get the Current Role
  const { role } = useRole();

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
        return "#2563eb";
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
          border: "1px solid #bfdbfe",
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

  // ✅ 4. FILTER ACTIONS: Only show if the user can 'create' in that module
  const allowedActions = allActions.filter((action) =>
    permissionService.can(role, action.module, "create"),
  );

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
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
            }}
          >
            This Month
          </Button>
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
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
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
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
            {/* ✅ QUICK ACTIONS (FILTERED) */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 3, color: "#0f172a" }}
              >
                Quick Actions
              </Typography>

              {allowedActions.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No quick actions available for your role.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {allowedActions.map((action) => (
                    <Grid size={6} key={action.label}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(action.path)}
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
                          color: "#475569",
                          bgcolor: "#fff",
                          textTransform: "none",
                          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                          "&:hover": {
                            bgcolor: "#f8fafc",
                            borderColor: "#94a3b8",
                            color: "#0f172a",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {action.icon}
                        <Typography variant="body2" fontWeight={600}>
                          {action.label}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {/* System Alert & AI Assistant */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#fffbeb",
                border: "1px solid #fcd34d",
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
                  "&:hover": { bgcolor: "#b45309", boxShadow: "none" },
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
                bgcolor: "#eff6ff",
                border: "1px dashed #60a5fa",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeOutlinedIcon color="primary" />
                <Typography fontWeight={800} color="primary.main">
                  AI Assistant
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask QMS..."
                sx={{
                  mt: 2,
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
