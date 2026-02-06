import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import { useRole } from "../../app/providers/RoleProvider";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";

export default function IntegrationsStatus() {
  const { role } = useRole();
  const canView = role === "Admin" || role === "QA";

  const integrations = [
    {
      name: "ERP System",
      description: "Enterprise Resource Planning integration",
      status: "Not Configured",
      connected: false,
    },
    {
      name: "Single Sign-On (SSO)",
      description: "Authentication via corporate identity provider",
      status: "Not Configured",
      connected: false,
    },
    {
      name: "Email Server (SMTP)",
      description: "Notification email delivery",
      status: "Not Configured",
      connected: false,
    },
    {
      name: "External Audit System",
      description: "Third-party audit trail logging",
      status: "Not Configured",
      connected: false,
    },
  ];

  if (!canView) {
    return (
      <Box>
        <Alert severity="warning">
          <strong>Access Restricted:</strong> Only Administrators and QA personnel can view integration status.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IntegrationInstructionsIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Integrations Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            External system connections and their status
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <LockIcon fontSize="small" />
        <strong>Read-Only:</strong> Integration configuration requires system administrator access via backend configuration.
      </Alert>

      <Divider sx={{ my: 3 }} />

      {integrations.map((integration, index) => (
        <Paper key={index} sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {integration.name}
                </Typography>
                {integration.connected ? (
                  <CheckCircleIcon sx={{ color: "#10b981" }} />
                ) : (
                  <CancelIcon sx={{ color: "#ef4444" }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {integration.description}
              </Typography>
              <Chip
                label={integration.status}
                size="small"
                sx={{
                  bgcolor: integration.connected ? "#d1fae5" : "#fee2e2",
                  color: integration.connected ? "#065f46" : "#991b1b",
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
