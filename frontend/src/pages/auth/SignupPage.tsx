import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../../services/auth.service";
import { useSnackbar } from "notistack";

export default function SignupPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    try {
      if (!fullName || !email || !password) {
        enqueueSnackbar("All fields are required.", { variant: "error" });
        return;
      }

      authService.signup({ fullName, email, password });

      // set default role on signup
      localStorage.setItem("qms_role", "QA");

      enqueueSnackbar("Signup successful ✅", { variant: "success" });
      navigate("/", { replace: true });
    } catch (err: any) {
      enqueueSnackbar(err.message || "Signup failed", { variant: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Create Account
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          NexGen QMS • Pharma friendly onboarding
        </Typography>

        <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleSignup} fullWidth variant="contained">
            Sign Up
          </Button>

          <Button
            onClick={() => navigate("/login")}
            fullWidth
            variant="text"
          >
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
