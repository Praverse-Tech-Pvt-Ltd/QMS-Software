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
  Stack
} from "@mui/material";
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useState } from "react";
import { type TrainingPlan } from "../../services/training.service";

interface RetrainingImpactModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void; // ✅ Fixed: Added required callback
  plan: TrainingPlan | null;           // ✅ Fixed: Added plan data prop
}

export default function RetrainingImpactModal({ 
  open, onClose, onConfirm, plan 
}: RetrainingImpactModalProps) {
  
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");

  const impactedRoles = ["Production Operator", "Line Supervisor", "Maintenance"];
  const impactedCount = 12;

  const handleAssign = () => {
      // ✅ Handshake: Pass the reason back to the parent for the Audit Trail
      const finalReason = reason || `Retraining initiated for ${plan?.title} due to version update.`;
      onConfirm(finalReason);
      setStep(2); 
  };

  const handleClose = () => {
      setStep(1);
      setReason("");
      onClose();
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, pt: 3 }}>
        <AssessmentIcon color="warning" />
        Training Impact Analysis
      </DialogTitle>
      
      <DialogContent sx={{ mt: 1 }}>
        {step === 1 ? (
            <Stack spacing={3}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800 }}>
                        Target Document
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                        {plan.title} (Revision {plan.version || "1.0"})
                    </Typography>
                </Box>
                
                <Box sx={{ bgcolor: '#fff4e5', p: 2, borderRadius: 2, border: '1px solid #ffe7cc' }}>
                    <Typography variant="body2" color="warning.dark" sx={{ lineHeight: 1.6 }}>
                        <b>System Analysis:</b> Significant updates detected in core procedures. 
                        Retraining is recommended to maintain site compliance and operator safety.
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Impacted Groups:</Typography>
                    <List dense sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        {impactedRoles.map(role => (
                            <ListItem key={role}>
                                <ListItemIcon sx={{ minWidth: 40 }}><Checkbox size="small" defaultChecked /></ListItemIcon>
                                <ListItemText primary={role} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <TextField 
                    label="Justification for Retraining"
                    placeholder="e.g., Major updates to Safety section 4.0..."
                    fullWidth
                    multiline
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1 }}>
                    <AvatarGroup max={4}>
                        <Avatar sx={{ bgcolor: '#4f46e5', fontSize: '0.75rem' }}>RK</Avatar>
                        <Avatar sx={{ bgcolor: '#7c3aed', fontSize: '0.75rem' }}>AS</Avatar>
                        <Avatar sx={{ bgcolor: '#db2777', fontSize: '0.75rem' }}>JP</Avatar>
                        <Avatar sx={{ bgcolor: '#10b981', fontSize: '0.75rem' }}>+9</Avatar>
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        <b>{impactedCount} Employees</b> will receive "Read & Understand" assignments.
                    </Typography>
                </Box>
            </Stack>
        ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ 
                    width: 60, height: 60, borderRadius: '50%', bgcolor: '#dcfce7', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 
                }}>
                    <UpdateIcon sx={{ color: '#15803d', fontSize: 32 }} />
                </Box>
                <Typography variant="h5" color="success.main" fontWeight={900}>
                    Assignments Dispatched
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 4 }}>
                    {impactedCount} Training Tasks have been successfully issued to personnel. 
                    Compliance metrics have been updated.
                </Typography>
            </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {step === 1 ? (
             <>
                <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
                <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={handleAssign}
                    disabled={!reason}
                    sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
                >
                    Confirm & Dispatch
                </Button>
             </>
        ) : (
             <Button variant="contained" onClick={handleClose} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Return to Plan
             </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}