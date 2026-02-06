import {
  Box,
  Paper,
  Typography,
  MenuItem,
  TextField,
  Button,
  LinearProgress,
  Grid,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Simple "Bar Chart" using CSS
const BarChartPlaceholder = ({ data }: any) => (
  <Box
    sx={{
      mt: 2,
      display: "flex",
      alignItems: "flex-end",
      height: 200,
      gap: 2,
      pb: 4,
      borderBottom: "1px solid #eee",
    }}
  >
    {data.map((item: any) => (
      <Box key={item.label} sx={{ flex: 1, textAlign: "center" }}>
        <Box
          sx={{
            height: `${item.val}%`,
            bgcolor: item.color || "primary.main",
            borderRadius: "4px 4px 0 0",
            transition: "height 1s",
          }}
        />
        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          {item.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default function ReportsPage() {
  const { role } = useRole();
  // ✅ Fix: Handle nullable role
  const canExport = role
    ? permissionService.can(role, "reports", "export")
    : false;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={900}>
          Quality Analytics
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            size="small"
            label="Time Range"
            defaultValue="Q1 2024"
            sx={{ width: 150 }}
          >
            <MenuItem value="Q1 2024">Q1 2024</MenuItem>
            <MenuItem value="2023 Full Year">2023 Full Year</MenuItem>
          </TextField>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            disabled={!canExport}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Chart 1: Deviations by Category (Pareto) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Deviations by Root Cause
            </Typography>
            <BarChartPlaceholder
              data={[
                { label: "Human Error", val: 80, color: "#1976d2" },
                { label: "Equipment", val: 50, color: "#42a5f5" },
                { label: "Material", val: 30, color: "#90caf9" },
                { label: "Method", val: 15, color: "#e3f2fd" },
              ]}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <b>Insight:</b> Human Error accounts for 45% of total deviations
              this quarter. Recommended: Increase training frequency.
            </Typography>
          </Paper>
        </Grid>

        {/* Chart 2: CAPA Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              CAPA Closure Rate
            </Typography>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Closed On Time (85%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={85}
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Overdue (15%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={15}
                color="error"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              There are currently <b>3 Overdue CAPAs</b> requiring immediate
              attention.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
