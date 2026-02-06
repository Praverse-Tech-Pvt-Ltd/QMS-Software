import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StorageIcon from "@mui/icons-material/Storage";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

export default function SystemInfo() {
  const systemData = {
    version: "1.0.0",
    buildDate: "2024-01-15",
    environment: "Production",
    database: "PostgreSQL 15.2",
    supportEmail: "support@qms.example.com",
    supportPhone: "+1 (555) 123-4567",
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <InfoIcon sx={{ fontSize: 32, color: "#3b82f6" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            System Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Application version and support details
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <BuildIcon sx={{ color: "#6366f1" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Application Version
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#6366f1" }}>
              v{systemData.version}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: "#10b981" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Build Date
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {new Date(systemData.buildDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <StorageIcon sx={{ color: "#f59e0b" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Environment
              </Typography>
            </Box>
            <Chip
              label={systemData.environment}
              sx={{
                bgcolor: "#dbeafe",
                color: "#1e40af",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Database: {systemData.database}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <SupportAgentIcon sx={{ color: "#ec4899" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Support Contact
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Email:</strong> {systemData.supportEmail}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {systemData.supportPhone}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
