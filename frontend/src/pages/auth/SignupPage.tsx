import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined"; 
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Architecture Imports
import api from "../../services/api";
import { useRole } from "../../app/providers/RoleProvider";
import { type UserRole } from "../../types/permissions.types"; // Assuming you have this type defined

export default function SignupPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 1. Register the User
      await api.post("/auth/register/", {
        username: username,
        email: email,
        password: password,
        first_name: name,
      });

      // 2. ✅ Auto-Login Immediately (Get the Token)
      const loginResponse = await api.post("/auth/login/", {
        username,
        password,
      });

      // 3. Extract Token & Role
      const { access, role } = loginResponse.data;

      // 4. ✅ Save to LocalStorage & Context
      localStorage.setItem("qms_token", access);
      setRole(role as UserRole); // Cast to your strict Role type

      // 5. ✅ Force Redirect to Dashboard (Bypassing Login Page)
      navigate("/", { replace: true });

    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.username 
        ? "Username already taken" 
        : "Signup failed. Please try again.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 5,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Branding */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              mb: 2,
              borderRadius: 3,
              bgcolor: "#1e40af",
              color: "white",
              fontSize: 24,
              fontWeight: 900,
              display: "grid",
              placeItems: "center",
            }}
          >
            N
          </Box>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            NexGen Pharma
          </Typography>
        </Box>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/login")}
          sx={{ mb: 3, textTransform: "none", color: "#64748b" }}
        >
          Back to login
        </Button>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          
          <TextField
            label="Username"
            placeholder="jdoe24"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <BadgeOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
            }}
          />

          <TextField
            label="Full Name"
            placeholder="John Doe"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
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
              startAdornment: <MailOutlineOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
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
              startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
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
              startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
            }}
          />

          <FormControlLabel
            control={<Checkbox required />}
            label={
              <Typography variant="body2" color="#64748b">
                I agree to the{" "}
                <Typography component="span" color="primary" fontWeight={600}>
                  Terms
                </Typography>{" "}
                and{" "}
                <Typography component="span" color="primary" fontWeight={600}>
                  Privacy Policy
                </Typography>
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              py: 1.5,
              bgcolor: "#1e40af",
              "&:hover": { bgcolor: "#1e3a8a" },
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 NexGen Pharma Solutions Pvt. Ltd.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}