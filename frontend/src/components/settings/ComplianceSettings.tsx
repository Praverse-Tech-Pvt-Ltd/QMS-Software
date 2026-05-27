import { Box, Typography, Paper, Grid, Alert, Chip } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import LockIcon from "@mui/icons-material/Lock";

export default function ComplianceSettings() {
  // ✅ Removed unused 'role' declaration to fix the warning

  const settings = [
    {
      label: "E-Signature Policy",
      value: "21 CFR Part 11 Compliant",
      locked: true,
    },
    {
      label: "Audit Trail Retention",
      value: "7 Years (Minimum)",
      locked: true,
    },
    {
      label: "Password Complexity",
      value: "Strong (Min 12 chars, uppercase, lowercase, number, special)",
      locked: true,
    },
    {
      label: "Session Timeout",
      value: "30 minutes of inactivity",
      locked: true,
    },
    {
      label: "Failed Login Attempts",
      value: "5 attempts before lockout",
      locked: true,
    },
    { label: "Account Lockout Duration", value: "30 minutes", locked: true },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <GavelIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Compliance & Audit Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            GxP and FDA regulatory compliance parameters
          </Typography>
        </Box>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Compliance Locked:</strong> These settings are defined by
        regulatory requirements and cannot be modified without system
        administrator intervention.
      </Alert>

      <Grid container spacing={3}>
        {settings.map((setting) => (
          <Grid size={{ xs: 12, md: 6 }} key={setting.label}>
            <Paper
              sx={{
                p: 3,
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                bgcolor: "#fafbfc",
                boxShadow: "none",
                height: "100%",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <LockIcon sx={{ fontSize: 18, color: "#64748b" }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {setting.label}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#1e293b" }}
              >
                {setting.value}
              </Typography>
              {setting.locked && (
                <Chip
                  label="Configuration Locked"
                  size="small"
                  sx={{
                    mt: 1.5,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: "#e2e8f0",
                    color: "#475569",
                  }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        <strong>Compliance Note:</strong> All changes to security and audit
        settings are logged and require validation evidence per Annex 11 and
        Part 11.
      </Alert>
    </Box>
  );
}
