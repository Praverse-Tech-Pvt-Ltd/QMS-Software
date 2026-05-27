import {
  Box,
  Typography,
  TextField,
   Grid,
  Button,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import SaveIcon from "@mui/icons-material/Save";
import BusinessIcon from "@mui/icons-material/Business";
import ConfirmDialog from "../common/ConfirmDialog";

export default function OrganizationSettings() {
  const { role } = useRole();
  const canEdit = role === "Admin";
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "NexGen Pharma Inc.",
    siteName: "Manufacturing Site - Building A",
    timezone: "America/New_York (EST/EDT)",
    dateFormat: "YYYY-MM-DD",
    docPrefix: "DOC-",
    devPrefix: "DEV-",
    capaPrefix: "CAPA-",
    changePrefix: "CC-",
  });

  const handleSave = () => {
    setSaveDialogOpen(false);
    // Mock save logic
    console.log("Organization settings saved:", settings);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <BusinessIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Organization Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure company information and system-wide identifiers
          </Typography>
        </Box>
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Read-Only Access:</strong> Only Administrators can modify organization-wide parameters.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#fafbfc' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
          Company Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
              helperText="Legal entity name for document headers"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Site / Plant Name"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
              helperText="Specific manufacturing or laboratory site"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#fafbfc' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
          System Prefixes (ID Generation)
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Document"
              value={settings.docPrefix}
              onChange={(e) => setSettings({ ...settings, docPrefix: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Deviation"
              value={settings.devPrefix}
              onChange={(e) => setSettings({ ...settings, devPrefix: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="CAPA"
              value={settings.capaPrefix}
              onChange={(e) => setSettings({ ...settings, capaPrefix: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Change Control"
              value={settings.changePrefix}
              onChange={(e) => setSettings({ ...settings, changePrefix: e.target.value })}
              fullWidth
              size="small"
              disabled={!canEdit}
            />
          </Grid>
        </Grid>
      </Paper>

      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
            sx={{
              bgcolor: "#6366f1",
              fontWeight: 700,
              px: 4,
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            Save Configuration
          </Button>
        </Box>
      )}

      {/* ✅ FIXED: Changed 'onCancel' to 'onClose' to match ConfirmDialog interface */}
      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Organization Settings?"
        message="Changes to organization settings will affect the entire system. This action will be logged in the audit trail."
        onConfirm={handleSave}
        onClose={() => setSaveDialogOpen(false)}
      />
    </Box>
  );
}