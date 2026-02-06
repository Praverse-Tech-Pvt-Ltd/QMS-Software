import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";

export default function SystemDefaults() {
  const { role } = useRole();
  const canEdit = role === "Admin";

  const [defaults, setDefaults] = useState({
    reviewFrequency: "12",
    retrainingInterval: "12",
    allowedFileTypes: ".pdf, .docx, .xlsx, .jpg, .png",
    maxAttachmentSize: "25",
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            System Defaults & Rules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure default system behaviors
          </Typography>
        </Box>
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Read-Only Access:</strong> Only Administrators can modify system defaults.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Document Review Frequency"
            value={defaults.reviewFrequency}
            onChange={(e) => setDefaults({ ...defaults, reviewFrequency: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Months between periodic reviews"
            type="number"
            InputProps={{ endAdornment: "months" }}
          />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Training Retraining Interval"
            value={defaults.retrainingInterval}
            onChange={(e) => setDefaults({ ...defaults, retrainingInterval: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Months before retraining required"
            type="number"
            InputProps={{ endAdornment: "months" }}
          />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Allowed File Types"
            value={defaults.allowedFileTypes}
            onChange={(e) => setDefaults({ ...defaults, allowedFileTypes: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Comma-separated file extensions"
          />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            label="Maximum Attachment Size"
            value={defaults.maxAttachmentSize}
            onChange={(e) => setDefaults({ ...defaults, maxAttachmentSize: e.target.value })}
            fullWidth
            disabled={!canEdit}
            helperText="Maximum file size in MB"
            type="number"
            InputProps={{ endAdornment: "MB" }}
          />
        </Grid>
      </Grid>

      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 3, borderTop: "1px solid #e2e8f0", mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Save Defaults
          </Button>
        </Box>
      )}
    </Box>
  );
}
