import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { SignatureMeaning } from "../../types/workflow.types";

export default function ESignModal({
  open,
  title = "E-Signature Required",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (payload: {
    username: string;
    password: string;
    meaning: SignatureMeaning;
    comment: string;
  }) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [meaning, setMeaning] = useState<SignatureMeaning>("Approval");
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm({
      username,
      password,
      meaning,
      comment,
    });

    // reset (optional)
    setUsername("");
    setPassword("");
    setMeaning("Approval");
    setComment("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          This is a UI placeholder for e-signature. Actual authentication and
          compliance rules will be integrated later.
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Re-enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="demo.user"
            fullWidth
          />

          <TextField
            label="Re-enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
            fullWidth
          />

          <TextField
            select
            label="Signature Meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value as SignatureMeaning)}
            fullWidth
          >
            <MenuItem value="Review">Review</MenuItem>
            <MenuItem value="Approval">Approval</MenuItem>
            <MenuItem value="Execution">Execution</MenuItem>
          </TextField>

          <TextField
            label="Signature Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirm Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
}
