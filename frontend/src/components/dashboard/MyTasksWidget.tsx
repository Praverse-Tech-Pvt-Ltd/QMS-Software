import { Box, Chip, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchMyTasks } from "../../services/api"; // ✅ Use the real API service

// ✅ Align with the backend response structure
export interface TaskItem {
  id: string;
  type: string;
  title: string;
  status: string;
  due_date: string; // ✅ Fixed casing (from due_Date to due_date)
  priority: string;
}

function getStatusChip(status: string) {
  const s = status.toUpperCase();
  let color: "error" | "success" | "warning" | "default" = "default";

  if (s.includes("OVERDUE") || s.includes("REJECTED")) color = "error";
  if (s.includes("CLOSED") || s.includes("DONE") || s.includes("EFFECTIVE"))
    color = "success";
  if (s.includes("REVIEW") || s.includes("PENDING")) color = "warning";

  return (
    <Chip
      size="small"
      label={status}
      color={color}
      sx={{ fontWeight: 700, fontSize: "0.65rem" }}
    />
  );
}

export default function MyTasksWidget() {
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    // ✅ Use the real fetch function
    fetchMyTasks().then((data) => setTasks(data as TaskItem[]));
  }, []);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    if (tab === 0) return tasks;
    if (tab === 1)
      return tasks.filter((t) => t.status !== "OVERDUE" && t.due_date >= today);
    return tasks.filter((t) => t.status === "OVERDUE" || t.due_date < today);
  }, [tab, tasks]);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        boxShadow: "none",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        My Priority Tasks
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: 40,
            fontWeight: 700,
            fontSize: "0.85rem",
          },
        }}
      >
        <Tab label="All" />
        <Tab label="Due Soon" />
        <Tab label="Overdue" />
      </Tabs>

      <Box sx={{ mt: 2, display: "grid", gap: 1.2 }}>
        {filtered.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", py: 2, textAlign: "center" }}
          >
            No pending tasks found for this category.
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
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#f1f5f9", transform: "translateX(4px)" },
              }}
            >
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="body2"
                  noWrap // ✅ This is a direct prop
                  sx={{ fontWeight: 700 }} // ✅ This belongs in sx
                >
                  {task.title}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "flex", gap: 1 }}
                >
                  <Box
                    component="span"
                    sx={{ color: "primary.main", fontWeight: 800 }}
                  >
                    {task.type}
                  </Box>
                  • Due: {task.due_date} {/* ✅ Fixed property name */}
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
