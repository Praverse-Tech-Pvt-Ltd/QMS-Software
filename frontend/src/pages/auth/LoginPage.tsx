import { Box, Button, TextField, Typography, Alert, InputAdornment, IconButton, Link } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { authService } from "../../services/auth.service";
import { useRole } from "../../app/providers/RoleProvider";
import { type UserRole } from "../../services/permission.service";
import AuthLayout from "../../components/auth/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.login(username, password);
      setRole(user.role as UserRole);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error(err);
      setError("That username and password don't match. Check both and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your NexGen QMS account."
      footer={
        <Typography variant="body2">
          New to the system?{" "}
          <Link component={RouterLink} to="/signup" underline="hover" sx={{ fontWeight: 600 }}>
            Create an account
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

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          disabled={loading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || !username || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <Typography variant="caption" sx={{ textAlign: "center" }}>
          Forgot your password? Contact your QA system administrator.
        </Typography>
      </Box>
    </AuthLayout>
  );
}
