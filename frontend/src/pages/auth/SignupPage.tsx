import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton, LinearProgress, Link } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import api from "../../services/api";
import { setAccessToken } from "../../services/tokenStore";
import { useRole } from "../../app/providers/RoleProvider";
import { type UserRole } from "../../services/permission.service";
import AuthLayout from "../../components/auth/AuthLayout";
import { color } from "../../theme/tokens";

function passwordStrength(pwd: string) {
  let s = 0;
  if (pwd.length >= 8) s += 25;
  if (pwd.length >= 12) s += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s += 25;
  if (/[0-9]/.test(pwd)) s += 12.5;
  if (/[^a-zA-Z0-9]/.test(pwd)) s += 12.5;
  return Math.min(s, 100);
}

const STRENGTH = [
  { max: 25, label: "Weak", color: color.error },
  { max: 50, label: "Fair", color: color.warning },
  { max: 75, label: "Good", color: color.info },
  { max: 101, label: "Strong", color: color.success },
];

// Turn DRF field errors ({ username: ["..."] }) into one readable sentence.
function describeError(data: unknown): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.username) return "That username is already taken. Choose another.";
    for (const [field, msgs] of Object.entries(d)) {
      const msg = Array.isArray(msgs) ? msgs[0] : msgs;
      if (typeof msg === "string") return field === "detail" || field === "non_field_errors" ? msg : `${field.replace(/_/g, " ")}: ${msg}`;
    }
  }
  return "We couldn't create the account. Check your connection and try again.";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = passwordStrength(password);
  const level = STRENGTH.find((l) => strength < l.max)!;
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register/", { username, email, password, first_name: name, role: "Viewer" });
      const { data } = await api.post("/auth/login/", { username, password });

      // Access token kept in memory only (never localStorage): 21 CFR Part 11 requirement
      setAccessToken(data.access);
      sessionStorage.setItem("qms_user", JSON.stringify({ email: username, name: name || username, role: data.role }));
      setRole(data.role as UserRole);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const data = (err as { response?: { data?: unknown } }).response?.data;
      setError(describeError(data));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = username && name && email && password && confirm && !mismatch && !loading;

  return (
    <AuthLayout
      title="Create an account"
      subtitle="New accounts start with view-only access. An administrator assigns your role."
      footer={
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required disabled={loading} autoFocus />
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required disabled={loading} />
        </Box>

        <TextField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required fullWidth disabled={loading} />

        <Box>
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {password && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1.5 }} aria-live="polite">
              <LinearProgress
                variant="determinate"
                value={strength}
                aria-label="Password strength"
                sx={{ flex: 1, height: 4, "& .MuiLinearProgress-bar": { bgcolor: level.color } }}
              />
              <Typography variant="caption" sx={{ color: level.color, fontWeight: 600, minWidth: 44, textAlign: "right" }}>
                {level.label}
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          fullWidth
          disabled={loading}
          error={mismatch}
          helperText={mismatch ? "Passwords don't match." : " "}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={!canSubmit}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </Box>
    </AuthLayout>
  );
}
