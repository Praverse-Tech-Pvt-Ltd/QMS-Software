import {
  Box, Button, TextField, Typography, Paper, Alert, InputAdornment,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/auth.service";
import { useRole } from "../../app/providers/RoleProvider";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { mustChangePassword, setMustChangePassword } = useRole();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMustChangePassword(false);
      navigate("/", { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      const message =
        data?.new_password?.[0] || data?.current_password?.[0] || data?.detail ||
        "Failed to change password. Please check your entries and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Paper elevation={24} sx={{ width: "100%", maxWidth: 440, borderRadius: 4, p: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          {mustChangePassword ? "Password Change Required" : "Change Password"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {mustChangePassword
            ? "Your password has expired or must be changed before you can continue. Per 21 CFR Part 11, passwords must be complex and cannot reuse recent passwords."
            : "Choose a new password. It must be complex and cannot reuse your last 5 passwords."}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="At least 8 characters, with uppercase, lowercase, a digit, and a special character."
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1, py: 1.5 }}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
