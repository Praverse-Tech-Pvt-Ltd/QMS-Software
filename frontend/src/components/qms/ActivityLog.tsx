import { Box, Paper, Typography } from "@mui/material";

const mockLogs = [
  { time: "2026-01-21 10:20", action: "Created document record", by: "M. Shah" },
  { time: "2026-01-21 11:05", action: "Submitted for QA Review", by: "M. Shah" },
  { time: "2026-01-21 12:40", action: "Reviewer assigned", by: "QA Team" },
];

export default function ActivityLog() {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Activity Log
      </Typography>

      <Box sx={{ display: "grid", gap: 1.2 }}>
        {mockLogs.map((log, idx) => (
          <Box
            key={idx}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {log.action}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {log.time} • {log.by}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
