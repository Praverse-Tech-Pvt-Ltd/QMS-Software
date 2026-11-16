import { Box, Button, Paper, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format, isBefore, parseISO, startOfDay } from "date-fns";

import { useRole } from "../../app/providers/RoleProvider";
import { permissionService, type ModuleKey } from "../../services/permission.service";
import { fetchDashboardStats, fetchMyTasks } from "../../services/api";
import { color } from "../../theme/tokens";

type Counts = { open: number; overdue: number };
type Stats = {
  quality: { deviations: Counts; capas: Counts; change_controls: Counts; department_hotspots: { department: string; count: number }[] };
  user: { pending_training: number; assigned_capas: number; total_tasks: number };
};
type Task = { id: string; type: string; title: string; status: string; due_date?: string | null; priority?: string };

const EMPTY: Stats = {
  quality: {
    deviations: { open: 0, overdue: 0 },
    capas: { open: 0, overdue: 0 },
    change_controls: { open: 0, overdue: 0 },
    department_hotspots: [],
  },
  user: { pending_training: 0, assigned_capas: 0, total_tasks: 0 },
};

const TASK_PATH: Record<string, string> = {
  CAPA: "capa",
  "Change Control": "change-control",
  Training: "training",
  Document: "dms",
  Deviation: "deviations",
};

const ACTIONS: { label: string; path: string; module: ModuleKey }[] = [
  { label: "Deviation", path: "/deviations/new", module: "deviations" },
  { label: "CAPA", path: "/capa/new", module: "capa" },
  { label: "Document", path: "/dms/new", module: "dms" },
  { label: "Training", path: "/training/new", module: "training" },
];

function humanize(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

function dueInfo(due?: string | null) {
  if (!due) return { text: "No due date", overdue: false };
  const d = parseISO(due);
  return { text: format(d, "d MMM yyyy"), overdue: isBefore(d, startOfDay(new Date())) };
}

/** One cell of the status strip: label, count, and an explicit overdue note. */
function Metric({ label, value, overdue, onClick }: { label: string; value: number; overdue?: number; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        px: 2,
        py: 1.5,
        display: "grid",
        gap: 0.25,
        transition: "background-color 160ms cubic-bezier(0.25, 1, 0.5, 1)",
        "&:hover": { bgcolor: color.canvas },
        "&:focus-visible": { outline: `2px solid ${color.accent}`, outlineOffset: -2 },
      }}
    >
      <Typography variant="caption" component="span">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography component="span" sx={{ fontSize: "1.5rem", fontWeight: 600, color: color.ink, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </Typography>
        {overdue !== undefined && (
          <Typography component="span" sx={{ fontSize: "0.75rem", fontWeight: 600, color: overdue > 0 ? color.error : color.textMuted }}>
            {overdue > 0 ? `${overdue} overdue` : "none overdue"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <Box sx={{ px: 2, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${color.border}` }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {action}
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchMyTasks()])
      .then(([s, t]) => {
        setStats(s);
        setTasks(t.slice(0, 8));
      })
      .catch((err) => {
        console.error("Failed to load dashboard data", err);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const actions = ACTIONS.filter((a) => role && permissionService.can(role, a.module, "create"));
  const q = stats.quality;
  const hotspotMax = Math.max(1, ...q.department_hotspots.map((h) => h.count));

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h4" component="h1">
            Overview
          </Typography>
          <Typography variant="body2">{format(new Date(), "EEEE, d MMMM yyyy")}</Typography>
        </Box>
        {actions.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }} role="group" aria-label="Create new record">
            {actions.map((a) => (
              <Button key={a.label} variant="outlined" size="small" startIcon={<AddOutlinedIcon />} onClick={() => navigate(a.path)}>
                {a.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {failed && (
        <Paper sx={{ px: 2, py: 1.5, bgcolor: color.errorSoft, borderColor: color.errorSoft }}>
          <Typography variant="body2" sx={{ color: color.error }}>
            Some dashboard data couldn't be loaded. Figures below may be incomplete; refresh to try again.
          </Typography>
        </Paper>
      )}

      {/* Status strip */}
      <Paper
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
          "& > *:not(:last-child)": { borderRight: { md: `1px solid ${color.border}` } },
          "& > *": { borderBottom: { xs: `1px solid ${color.border}`, md: 0 } },
          overflow: "hidden",
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ px: 2, py: 1.5 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={30} />
            </Box>
          ))
        ) : (
          <>
            <Metric label="My open tasks" value={stats.user.total_tasks} onClick={() => navigate("/tasks")} />
            <Metric label="Open deviations" value={q.deviations.open} overdue={q.deviations.overdue} onClick={() => navigate("/deviations")} />
            <Metric label="Open CAPAs" value={q.capas.open} overdue={q.capas.overdue} onClick={() => navigate("/capa")} />
            <Metric label="Open change controls" value={q.change_controls.open} overdue={q.change_controls.overdue} onClick={() => navigate("/change-control")} />
            <Metric label="My pending training" value={stats.user.pending_training} onClick={() => navigate("/training/employees/my")} />
          </>
        )}
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" }, gap: 2.5, alignItems: "start" }}>
        {/* My tasks */}
        <Paper sx={{ overflow: "hidden" }}>
          <PanelHeader
            title="My tasks"
            action={
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/tasks")}>
                All tasks
              </Button>
            }
          />
          {loading ? (
            <Box sx={{ p: 2 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={32} />
              ))}
            </Box>
          ) : tasks.length === 0 ? (
            <Box sx={{ px: 3, py: 5, textAlign: "center", display: "grid", justifyItems: "center", gap: 0.75 }}>
              <TaskAltOutlinedIcon sx={{ color: color.success, fontSize: 28 }} aria-hidden />
              <Typography variant="subtitle1">You're all caught up</Typography>
              <Typography variant="body2" sx={{ maxWidth: 360 }}>
                Training, CAPAs and change controls assigned to you will appear here, soonest due first.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reference</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((t) => {
                    const due = dueInfo(t.due_date);
                    return (
                      <TableRow key={t.id} hover onClick={() => navigate(`/${TASK_PATH[t.type] || "tasks"}/${t.id}`)} sx={{ cursor: "pointer" }}>
                        <TableCell sx={{ fontWeight: 600, color: color.accent, whiteSpace: "nowrap" }}>{t.id}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{t.type}</TableCell>
                        <TableCell sx={{ maxWidth: 320, color: color.ink }}>
                          <Typography variant="body2" noWrap sx={{ color: "inherit" }}>
                            {t.title}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{humanize(t.status)}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap", color: due.overdue ? color.error : undefined, fontWeight: due.overdue ? 600 : undefined }}>
                          {due.overdue ? `Overdue · ${due.text}` : due.text}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>

        {/* Deviations by department */}
        <Paper sx={{ overflow: "hidden" }}>
          <PanelHeader title="Open deviations by department" />
          <Box sx={{ p: 2 }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={28} />)
            ) : q.department_hotspots.length === 0 ? (
              <Typography variant="body2">No open deviations. Departments with open deviations are ranked here.</Typography>
            ) : (
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1.25 }}>
                {q.department_hotspots.map((h) => (
                  <Box component="li" key={h.department || "unassigned"} sx={{ display: "grid", gap: 0.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: color.ink }} noWrap>
                        {h.department || "Unassigned"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: color.ink, fontVariantNumeric: "tabular-nums" }}>
                        {h.count}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 4, borderRadius: 2, bgcolor: color.border }} aria-hidden>
                      <Box sx={{ height: "100%", width: `${(h.count / hotspotMax) * 100}%`, borderRadius: 2, bgcolor: color.accent }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
