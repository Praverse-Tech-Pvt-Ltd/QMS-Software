import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
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
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Read-Only Access:</strong> Only Administrators can modify organization settings.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Company Information */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Company Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Company Name"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Legal entity name as registered"
          />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Site / Plant Name"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Physical location identifier"
          />
        </Grid>
      </Grid>

      {/* Regional Settings */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Regional Settings
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="System-wide default timezone"
          />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Date Format"
            value={settings.dateFormat}
            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Display format for dates"
          />
        </Grid>
      </Grid>

      {/* Document Prefixes */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        System Prefixes (ID Generation)
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <TextField
            label="Document Prefix"
            value={settings.docPrefix}
            onChange={(e) => setSettings({ ...settings, docPrefix: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="e.g., DOC-2024-001"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <TextField
            label="Deviation Prefix"
            value={settings.devPrefix}
            onChange={(e) => setSettings({ ...settings, devPrefix: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="e.g., DEV-2024-001"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <TextField
            label="CAPA Prefix"
            value={settings.capaPrefix}
            onChange={(e) => setSettings({ ...settings, capaPrefix: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="e.g., CAPA-2024-001"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <TextField
            label="Change Control Prefix"
            value={settings.changePrefix}
            onChange={(e) => setSettings({ ...settings, changePrefix: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="e.g., CC-2024-001"
          />
        </Grid>
      </Grid>

      {/* Actions */}
      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
            sx={{
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            Save Changes
          </Button>
        </Box>
      )}

      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Organization Settings?"
        message="Changes to organization settings will affect the entire system. This action will be logged in the audit trail."
        onConfirm={handleSave}
        onCancel={() => setSaveDialogOpen(false)}
      />
    </Box>
  );
}
