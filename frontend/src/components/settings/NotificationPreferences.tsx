import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  Divider,
  Button,
  Paper,
  Stack
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

  // ✅ Added handler to make toggles functional and use 'setPrefs'
  const handleToggle = (name: keyof typeof prefs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, [name]: event.target.checked });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Notification Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure how you receive system alerts and task updates
          </Typography>
        </Box>
      </Box>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Read-Only Access:</strong> Your role level allows you to view but not modify notification routing.
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafbfc' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Email Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={prefs.emailApprovalRequired} onChange={handleToggle('emailApprovalRequired')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>Approval Required Alerts</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={prefs.emailTaskAssigned} onChange={handleToggle('emailTaskAssigned')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>New Task Assignments</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={prefs.emailStatusChange} onChange={handleToggle('emailStatusChange')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>Record Status Updates</Typography>}
            />
          </FormGroup>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafbfc' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            In-App Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={prefs.inAppApprovalRequired} onChange={handleToggle('inAppApprovalRequired')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>Desktop Approval Prompts</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={prefs.inAppTaskAssigned} onChange={handleToggle('inAppTaskAssigned')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>Real-time Task Notifications</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={prefs.inAppStatusChange} onChange={handleToggle('inAppStatusChange')} disabled={!canEdit} />}
              label={<Typography variant="body2" fontWeight={500}>Global Activity Stream</Typography>}
            />
          </FormGroup>
        </Paper>
      </Stack>

      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 3, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              bgcolor: "#6366f1", 
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              borderRadius: 2,
              "&:hover": { bgcolor: "#4f46e5" } 
            }}
          >
            Save Preferences
          </Button>
        </Box>
      )}
    </Box>
  );
}