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
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      authService.signup({
        fullName: name,
        email,
        password,
      });

      // ✅ user is now authenticated, go straight to dashboard
      navigate("/", { replace: true });
    } catch (err: any) {
      alert(err.message || "Signup failed");
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
          maxWidth: 440,
          p: 5,
          borderRadius: 4,
        }}
      >
        {/* Branding */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
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

        {/* Back */}
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/login")}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back to login
        </Button>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          <TextField
            label="Full Name"
            placeholder="John Doe"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1 }} />,
            }}
          />

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

          <TextField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            fullWidth
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            InputProps={{
              startAdornment: <LockOutlinedIcon sx={{ mr: 1 }} />,
            }}
          />

          <FormControlLabel
            control={<Checkbox required />}
            label={
              <Typography variant="body2">
                I agree to the{" "}
                <Typography component="span" color="primary">
                  Terms of Service
                </Typography>{" "}
                and{" "}
                <Typography component="span" color="primary">
                  Privacy Policy
                </Typography>
              </Typography>
            }
          />

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
            Create Account
          </Button>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2026 NexGen Pharma Solutions Pvt. Ltd.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
