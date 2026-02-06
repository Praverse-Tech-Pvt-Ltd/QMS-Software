import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SaveIcon from "@mui/icons-material/Save";

export default function NotificationPreferences() {
  const { role } = useRole();
  const canEdit = role === "Admin" || role === "QA";

  const [prefs, setPrefs] = useState({
    emailApprovalRequired: true,
    emailTaskAssigned: true,
    emailStatusChange: false,
    inAppApprovalRequired: true,
    inAppTaskAssigned: true,
    inAppStatusChange: true,
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Notification Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure notification delivery channels
          </Typography>
        </Box>
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Read-Only Access:</strong> Only Administrators and QA can modify notification settings.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Email Notifications
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={prefs.emailApprovalRequired} disabled={!canEdit} />}
          label="Approval Required"
        />
        <FormControlLabel
          control={<Switch checked={prefs.emailTaskAssigned} disabled={!canEdit} />}
          label="Task Assigned to Me"
        />
        <FormControlLabel
          control={<Switch checked={prefs.emailStatusChange} disabled={!canEdit} />}
          label="Status Changes"
        />
      </FormGroup>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        In-App Notifications
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={prefs.inAppApprovalRequired} disabled={!canEdit} />}
          label="Approval Required"
        />
        <FormControlLabel
          control={<Switch checked={prefs.inAppTaskAssigned} disabled={!canEdit} />}
          label="Task Assigned to Me"
        />
        <FormControlLabel
          control={<Switch checked={prefs.inAppStatusChange} disabled={!canEdit} />}
          label="Status Changes"
        />
      </FormGroup>

      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 3, borderTop: "1px solid #e2e8f0", mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Save Preferences
          </Button>
        </Box>
      )}
    </Box>
  );
}
