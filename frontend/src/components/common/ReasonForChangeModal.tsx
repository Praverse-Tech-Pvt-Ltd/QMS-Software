import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Alert 
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useState } from "react";

interface ReasonForChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function ReasonForChangeModal({ 
  open, 
  onClose, 
  onConfirm 
}: ReasonForChangeModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason(""); // Reset
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        Reason for Change
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
            You are editing a <b>Controlled Document</b>. 
            A reason for change is required for the Audit Trail.
        </Alert>
        
        <TextField
            autoFocus
            label="Enter Reason"
            placeholder="e.g. Fixing typo in title, Updating scope per new regulation..."
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This will be permanently recorded in the Audit Log.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
            onClick={handleConfirm} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!reason.trim()}
        >
            Save Change
        </Button>
      </DialogActions>
    </Dialog>
  );
}