import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  try {
    authService.login(email, password);
    navigate("/", { replace: true });
  } catch (err: any) {
    alert(err.message || "Login failed");
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #F7F9FC, #E8EDF5)",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
        }}
      >
        {/* Branding */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              borderRadius: 3,
              bgcolor: "#1e40af",
              color: "white",
              fontSize: 28,
              fontWeight: 900,
              display: "grid",
              placeItems: "center",
            }}
          >
            N
          </Box>

          <Typography variant="h4" fontWeight={900}>
            NexGen Pharma
          </Typography>
          <Typography variant="caption" sx={{ letterSpacing: 1 }}>
            QUALITY SYSTEMS
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          <TextField
            label="Email Address"
            placeholder="you@example.com"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <MailOutlineOutlinedIcon sx={{ mr: 1 }} />,
            }}
          />

          <TextField
            label="Password"
            type="password"
            placeholder="••••••••"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <LockOutlinedIcon sx={{ mr: 1 }} />,
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormControlLabel
              control={<Checkbox />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Typography variant="body2" color="primary">
              Forgot password?
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              py: 1.5,
            }}
          >
            Sign In
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/signup")}
              sx={{ fontWeight: 700 }}
            >
              Create account
            </Button>
          </Typography>
        </Box>

        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 NexGen Pharma Solutions Pvt. Ltd.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
