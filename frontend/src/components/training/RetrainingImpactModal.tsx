import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
  TextField,
  Stack,
  alpha
} from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useState } from "react";
import { type TrainingPlan } from "../../services/training.service";

// ✅ Interface aligned with TrainingMatrixPage and TrainingDetailPage usage
interface RetrainingImpactModalProps {
  open: boolean;
  onClose: () => void;
  sopTitle: string; 
  oldVersion: string;
  newVersion: string;
  onConfirm: (reason: string) => void;
  plan: TrainingPlan | null; // Passed to ensure we have full context
}

export default function RetrainingImpactModal({
  open, 
  onClose, 
  sopTitle, 
  oldVersion, 
  newVersion, 
  onConfirm,
  plan
}: RetrainingImpactModalProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");

  // Logic: In a real system, these would be fetched based on the plan.id
  const impactedRoles = ["Production Operator", "Line Supervisor", "Maintenance"];
  const impactedCount = 12;

  const handleAssign = () => {
    // ✅ GxP Handshake: Pass the justification back for the Audit Trail
    const finalReason = reason || `Major revision update from ${oldVersion} to ${newVersion}.`;
    onConfirm(finalReason);
    setStep(2);
  };

  const handleClose = () => {
    setStep(1);
    setReason("");
    onClose();
  };

  // Prevent rendering if no plan data is ready
  if (!plan && open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 900,
          pt: 3,
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <AssessmentIcon color="warning" />
        Training Impact Analysis
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {step === 1 ? (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800, textTransform: "uppercase" }}
              >
                Subject Document
              </Typography>
              <Typography variant="body1" fontWeight={800} color="primary.main">
                {sopTitle}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                 <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 1, borderRadius: 1 }}>OLD: {oldVersion}</Typography>
                 <Typography variant="caption" sx={{ bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02', px: 1, borderRadius: 1, fontWeight: 700 }}>NEW: {newVersion}</Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                bgcolor: alpha("#ed6c02", 0.05),
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${alpha("#ed6c02", 0.1)}`,
              }}
            >
              <Typography variant="body2" color="warning.dark" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                <b>Regulatory Notice:</b> Version increment detected. System policy requires all qualified personnel to perform a "Read & Understand" task on the new revision to maintain compliant status.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
                Impacted Personnel Groups:
              </Typography>
              <List dense sx={{ border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: '#fcfcfc' }}>
                {impactedRoles.map((role) => (
                  <ListItem key={role}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox size="small" defaultChecked color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={role}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <TextField
              label="Change Justification (Required for Audit Trail)"
              placeholder="e.g., Critical safety update in Section 4.2..."
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, pt: 1, px: 1 }}>
              <AvatarGroup max={4}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#4f46e5", fontSize: "0.65rem" }}>RK</Avatar>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#7c3aed", fontSize: "0.65rem" }}>AS</Avatar>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#db2777", fontSize: "0.65rem" }}>JP</Avatar>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#10b981", fontSize: "0.65rem" }}>+9</Avatar>
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                <b>{impactedCount} Enrolled Staff</b> will be moved to "Pending Retraining" status.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <UpdateIcon sx={{ color: "#15803d", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" color="success.main" fontWeight={900}>
              Retraining Initiated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, px: 4, lineHeight: 1.6 }}>
              <b>{impactedCount} assignments</b> have been successfully dispatched. 
              The training matrix has been updated to reflect the new compliance requirements for {sopTitle}.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 1 }}>
        {step === 1 ? (
          <>
            <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 800 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleAssign}
              disabled={!reason}
              sx={{ fontWeight: 800, borderRadius: 2.5, px: 4, textTransform: 'none' }}
            >
              Confirm & Dispatch Tasks
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={handleClose}
            sx={{ fontWeight: 800, borderRadius: 2.5, py: 1.5 }}
          >
            Finish Impact Assessment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}