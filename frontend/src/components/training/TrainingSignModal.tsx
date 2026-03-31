import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface TrainingSignModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  planTitle: string;
}

export default function TrainingSignModal({ open, onClose, onConfirm, planTitle }: TrainingSignModalProps) {
  const [password, setPassword] = useState("");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" fontWeight={900}>E-Signature Verification</Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          To certify completion of <strong>{planTitle}</strong>, please re-enter your password. This action will be logged as a legal electronic signature.
        </Typography>
        <TextField
          type="password"
          label="Account Password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => { onConfirm(password); setPassword(""); }}
          disabled={!password}
        >
          Sign & Complete
        </Button>
      </DialogActions>
    </Dialog>
  );
}