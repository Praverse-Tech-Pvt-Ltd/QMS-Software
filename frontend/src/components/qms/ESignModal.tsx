import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box
} from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import type { SignatureMeaning } from '../../types/workflow.types';

interface ESignModalProps {
  open: boolean;
  onClose: () => void;
  onSign: (data: { meaning: SignatureMeaning; comment: string }) => void;
  actionLabel: string;
  forcedMeaning?: SignatureMeaning; // If the workflow dictates the meaning (e.g., Approval)
}

const ESignModal: React.FC<ESignModalProps> = ({
  open,
  onClose,
  onSign,
  actionLabel,
  forcedMeaning
}) => {
  const [password, setPassword] = useState('');
  const [meaning, setMeaning] = useState<SignatureMeaning>(forcedMeaning || 'Approval');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSign = () => {
    if (!password) {
      setError('Password is required for electronic signature.');
      return;
    }
    // Mock Password Check
    if (password === 'wrong') {
      setError('Invalid credentials.');
      return;
    }

    // Success
    onSign({ meaning, comment });
    // Reset fields
    setPassword('');
    setComment('');
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FingerprintIcon color="primary" />
        Electronic Signature
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to perform: <strong>{actionLabel}</strong>. 
            This action is legally binding equivalent to a handwritten signature (21 CFR Part 11).
          </Alert>
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel>Meaning of Signature</InputLabel>
          <Select
            value={meaning}
            label="Meaning of Signature"
            onChange={(e) => setMeaning(e.target.value as SignatureMeaning)}
            disabled={!!forcedMeaning}
          >
            <MenuItem value="Authorship">Authorship (I am the author)</MenuItem>
            <MenuItem value="Review">Review (I have reviewed this)</MenuItem>
            <MenuItem value="Approval">Approval (I approve this)</MenuItem>
            <MenuItem value="Execution">Execution (I have executed this task)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Password / Pin"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
          autoFocus
        />

        <TextField
          label="Additional Comments (Optional)"
          fullWidth
          multiline
          rows={2}
          margin="normal"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        
        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
          Server Timestamp: {new Date().toUTCString()}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSign} 
          variant="contained" 
          color="primary"
          disabled={!password}
        >
          Sign & Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ESignModal;