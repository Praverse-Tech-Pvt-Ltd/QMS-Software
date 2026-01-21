import {
  Box,
  Chip,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { dashboardService } from "../../services/dashboard.service";
import type { TaskItem } from "../../mock/dashboard.mock";

function getStatusChip(status: TaskItem["status"]) {
  const variant = status === "Overdue" ? "error" : status === "Completed" ? "success" : "default";
  return <Chip size="small" label={status} color={variant as any} />;
}

export default function MyTasksWidget() {
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    dashboardService.getMyTasks().then(setTasks);
  }, []);

  const filtered = useMemo(() => {
    if (tab === 0) return tasks; // Assigned to me (all mock)
    if (tab === 1) return tasks.filter((t) => t.status !== "Overdue"); // Due soon mock
    return tasks.filter((t) => t.status === "Overdue");
  }, [tab, tasks]);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        My Tasks
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mt: 1 }}
      >
        <Tab label="Assigned to me" />
        <Tab label="Due soon" />
        <Tab label="Overdue" />
      </Tabs>

      <Box sx={{ mt: 2, display: "grid", gap: 1.2 }}>
        {filtered.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No tasks found.
          </Typography>
        ) : (
          filtered.map((task) => (
            <Box
              key={task.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.4,
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {task.title}
                </Typography>

                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {task.module} • Due: {task.dueDate}
                </Typography>
              </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getStatusChip(task.status)}
                </Box>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}
