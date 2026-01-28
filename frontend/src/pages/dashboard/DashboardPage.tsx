import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import StatusChip from "../../components/qms/StatusChip";

export default function DashboardPage() {
  const navigate = useNavigate();

  const kpis = [
    { label: "Pending Approvals", value: "12", change: "+2.1%", trend: "up" },
    { label: "Open Deviations", value: "08", change: "-5.4%", trend: "down" },
    { label: "Overdue Trainings", value: "05", change: "STEADY", trend: "neutral" },
    { label: "Active CAPAs", value: "14", change: "-3.2%", trend: "down" },
  ];

  const tasks = [
    {
      id: "TSK-2845",
      title: "Review and approve SOP-QA-2024-015 Manufacturing Process",
      status: "QA Review",
      priority: "High",
      due: "Jan 25, 2026",
    },
    {
      id: "TSK-2842",
      title: "Complete CAPA investigation for batch deviation DEV-098",
      status: "In Progress",
      priority: "Critical",
      due: "Jan 24, 2026",
    },
    {
      id: "TSK-2839",
      title: "Sign off training completion for GDP module",
      status: "Open",
      priority: "Medium",
      due: "Jan 28, 2026",
    },
  ];

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUpIcon fontSize="small" color="success" />;
    if (trend === "down") return <TrendingDownIcon fontSize="small" color="error" />;
    return <RemoveIcon fontSize="small" color="disabled" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Quality Dashboard Overview
          </Typography>
          <Typography color="text.secondary">
            Monitoring real-time compliance metrics for current cycle.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined">This Month</Button>
          <Button variant="outlined">Export PDF</Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Typography color="text.secondary" fontSize={14}>
                {kpi.label}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {kpi.value}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {trendIcon(kpi.trend)}
                  <Typography fontSize={13}>{kpi.change}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* My Tasks */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                My Tasks
              </Typography>
            </Box>

            <Divider />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>
                      <StatusChip status={t.status as any} />
                    </TableCell>
                    <TableCell>{t.priority}</TableCell>
                    <TableCell>{t.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "grid", gap: 2 }}>
            {/* Quick Actions */}
            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Quick Actions
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={6}>
                  <Button fullWidth variant="outlined" onClick={() => navigate("/dms/new")}>
                    <DescriptionOutlinedIcon />
                    New Doc
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button fullWidth variant="outlined" onClick={() => navigate("/deviations/new")}>
                    <ReportProblemOutlinedIcon />
                    Deviation
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button fullWidth variant="outlined" onClick={() => navigate("/training/new")}>
                    <SchoolOutlinedIcon />
                    Log Training
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button fullWidth variant="outlined" onClick={() => navigate("/capa/new")}>
                    <FactCheckOutlinedIcon />
                    CAPA
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* System Alert */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "rgba(255,193,7,0.12)",
                border: "1px solid rgba(255,193,7,0.4)",
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <WarningAmberOutlinedIcon color="warning" />
                <Box>
                  <Typography fontWeight={900}>System Alert</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quarterly audit scheduled for Feb 15, 2026.
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={() => navigate("/capa")}
              >
                Review Audit Readiness
              </Button>
            </Paper>

            {/* AI Assistant */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px dashed rgba(0,0,0,0.3)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeOutlinedIcon color="primary" />
                <Typography fontWeight={900}>AI Assistant</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your personal QMS guide will appear here.
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Ask a question..."
                sx={{ mt: 2 }}
                disabled
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
