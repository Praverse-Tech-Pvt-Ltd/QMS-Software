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
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"; 
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Architecture Imports
import api from "../../services/api";
import { useRole } from "../../app/providers/RoleProvider";
import {type  UserRole } from "../../types/permissions.types";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Send Login Request
      const response = await api.post("/auth/login/", { username, password });
      
      // 2. Extract Token & Role
      const { access, role } = response.data;

      // 3. ✅ Save Token to Storage FIRST
      localStorage.setItem("qms_token", access);
      
      // 4. ✅ Update Context (Triggers AuthGuard)
      setRole(role as UserRole); 

      // 5. ✅ Redirect (Replace prevents going back to login)
      navigate("/", { replace: true });

    } catch (err: any) {
      console.error(err);
      setError("Invalid username or password");
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
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
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
              boxShadow: "0 4px 6px -1px rgba(30, 64, 175, 0.2)",
            }}
          >
            N
          </Box>

          <Typography variant="h4" fontWeight={900} color="#0f172a">
            NexGen Pharma
          </Typography>
          <Typography variant="caption" sx={{ letterSpacing: 1, fontWeight: 700, color: "#64748b" }}>
            QUALITY SYSTEMS
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          <TextField
            label="Username" 
            placeholder="e.g. admin"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
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

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormControlLabel
              control={<Checkbox />}
              label={<Typography variant="body2" color="#64748b">Remember me</Typography>}
            />
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, cursor: "pointer" }}>
              Forgot password?
            </Typography>
          </Box>

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
              boxShadow: "0 4px 6px -1px rgba(30, 64, 175, 0.2)",
              "&:hover": { bgcolor: "#1e3a8a" },
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/signup")}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Create account
            </Button>
          </Typography>
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