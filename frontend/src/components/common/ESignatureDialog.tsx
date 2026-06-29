import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import FingerprintIcon from "@mui/icons-material/Fingerprint";

interface ESignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string, meaning: string) => Promise<void>;
  title?: string;
  meaning?: string;
  loading?: boolean;
}

export default function ESignatureDialog({
  open,
  onClose,
  onConfirm,
  title = "Electronic Signature Required",
  meaning = "I confirm this action",
  loading = false,
}: ESignatureDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError("Password is required for electronic signature.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(password, meaning);
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "E-signature failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#FAFBFC", borderBottom: "1px solid #E9ECEF", px: 3, py: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FingerprintIcon sx={{ color: "#667eea", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#2D3339">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              21 CFR Part 11 — Electronic Signature
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Signing meaning:</strong> {meaning}
          </Typography>
        </Alert>

        <TextField
          label="Enter your password to sign"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          error={!!error}
          helperText={error}
          autoFocus
          InputProps={{
            startAdornment: <LockIcon sx={{ color: "#9CA3AF", mr: 1, fontSize: 18 }} />,
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E9ECEF", gap: 1 }}>
        <Button variant="text" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!password || submitting || loading}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" }, minWidth: 120 }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Sign & Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
