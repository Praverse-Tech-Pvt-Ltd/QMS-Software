import { Box, Paper, Typography } from "@mui/material";

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Home Dashboard
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          ✅ Day 1 shell is ready. Tomorrow we’ll add KPI cards + tasks widget.
        </Typography>
      </Paper>
    </Box>
  );
}
