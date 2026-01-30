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
  ListItemIcon
} from "@mui/material";
import UpdateIcon from '@mui/icons-material/Update';
import { useState } from "react";

interface RetrainingImpactModalProps {
  open: boolean;
  onClose: () => void;
  sopTitle: string;
  oldVersion: string;
  newVersion: string;
}

export default function RetrainingImpactModal({ 
  open, onClose, sopTitle, oldVersion, newVersion 
}: RetrainingImpactModalProps) {
  
  const [step, setStep] = useState(1);

  const impactedRoles = ["Production Operator", "Line Supervisor", "Maintenance"];
  const impactedCount = 12;

  const handleAssign = () => {
      setStep(2); // Show success state
  };

  const handleClose = () => {
      setStep(1);
      onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <UpdateIcon color="warning" />
        Training Impact Analysis
      </DialogTitle>
      
      <DialogContent>
        {step === 1 ? (
            <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {sopTitle} updated: <span style={{color: 'red'}}>{oldVersion}</span> ➝ <span style={{color: 'green'}}>{newVersion}</span>
                </Typography>
                
                <Box sx={{ bgcolor: '#fff4e5', p: 2, borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" color="warning.dark">
                        <b>Impact Analysis:</b> Major changes to section 4.0 (Safety). 
                        Retraining is recommended for all associated roles.
                    </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Impacted Groups:</Typography>
                <List dense sx={{ border: '1px solid #eee', borderRadius: 2, mb: 2 }}>
                    {impactedRoles.map(role => (
                        <ListItem key={role}>
                             <ListItemIcon><Checkbox defaultChecked /></ListItemIcon>
                             <ListItemText primary={role} />
                        </ListItem>
                    ))}
                </List>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AvatarGroup max={4}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>RK</Avatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>AS</Avatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>JP</Avatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>+9</Avatar>
                    </AvatarGroup>
                    <Typography variant="caption" fontWeight={700}>
                        {impactedCount} Employees will be assigned "Read & Understand" tasks.
                    </Typography>
                </Box>
            </Box>
        ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" color="success.main" fontWeight={800}>
                    Assignments Created!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    12 Training Tasks have been dispatched with a due date of {new Date(Date.now() + 86400000 * 7).toLocaleDateString()}.
                </Typography>
            </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {step === 1 ? (
             <>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" color="warning" onClick={handleAssign}>
                    Confirm & Assign Retraining
                </Button>
             </>
        ) : (
             <Button onClick={handleClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}