import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import GavelIcon from '@mui/icons-material/Gavel';
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";

// Types
import type { SignatureMeaning } from "../../types/workflow.types";

interface ESignModalProps {
  open: boolean;
  onClose: () => void;
  onSign: (data: { 
    username: string; 
    password: string; 
    meaning: SignatureMeaning; 
    comment: string 
  }) => void;
  actionLabel: string; // e.g., "Approve", "Review"
  forcedMeaning?: SignatureMeaning; // If action implies meaning (e.g. Approve -> Approval)
}

const MEANINGS: SignatureMeaning[] = ["Review", "Approval", "Execution", "Authorship"];

export default function ESignModal({ 
  open, 
  onClose, 
  onSign, 
  actionLabel, 
  forcedMeaning 
}: ESignModalProps) {
  const { role } = useRole();
  
  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [meaning, setMeaning] = useState<SignatureMeaning>(forcedMeaning || "Approval");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSign = () => {
    // 1. Basic Validation
    if (!username || !password) {
      setError("Identity verification (Username & Password) is required.");
      return;
    }

    // 2. Mock Auth Check
    // In a real app, this would hit an API to verify credentials again
    if (password.length < 3) {
      setError("Invalid credentials (mock: password too short).");
      return;
    }

    // 3. Success
    setError("");
    onSign({ username, password, meaning, comment });
    onClose();
    
    // Reset fields
    setPassword("");
    setComment("");
    setUsername("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Secure Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <GavelIcon fontSize="large" />
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
               Electronic Signature Required
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
               Action: <b>{actionLabel}</b> • Role: {role}
            </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Alert severity="info" icon={<LockIcon fontSize="inherit" />}>
                 I certify that I am the user identified below and I authorize this action. This is legally binding.
            </Alert>

            {/* Credential Re-entry (21 CFR Part 11 Requirement) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g. jdoe"
                    autoFocus
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>

            {/* Signature Meaning */}
            <TextField
                select
                label="Meaning of Signature"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value as SignatureMeaning)}
                fullWidth
                disabled={!!forcedMeaning} // Lock if forced (e.g. Approve button must mean Approval)
                helperText="Why are you signing this record?"
            >
                {MEANINGS.map((m) => (
                    <MenuItem key={m} value={m}>
                        {m}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                label="Comments (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="Add context to your signature..."
            />
            
            <Typography variant="caption" display="block" sx={{ color: 'text.disabled', textAlign: 'right' }}>
               Server Timestamp: {new Date().toUTCString()}
            </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
            onClick={handleSign} 
            variant="contained" 
            color="primary"
            startIcon={<GavelIcon />}
            disabled={!username || !password}
        >
          Digitally Sign & Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}