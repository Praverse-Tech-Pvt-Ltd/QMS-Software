import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
  Fade,
  Slide,
  Grow,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);
  const getStrengthColor = () => {
    if (passwordStrength < 25) return "#ef4444";
    if (passwordStrength < 50) return "#f59e0b";
    if (passwordStrength < 75) return "#eab308";
    return "#10b981";
  };
  const getStrengthLabel = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

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
        role: "Viewer", 
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          animation: "float 20s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-15%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          animation: "float 15s ease-in-out infinite reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(30px, 30px) rotate(180deg)" },
        },
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={24}
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
        >
          <Slide direction="down" in timeout={900}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                py: 3,
                px: 4,
                textAlign: "center",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  mb: 1,
                  animation: "pulse 3s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" },
                    "50%": { transform: "scale(1.05)", boxShadow: "0 12px 48px rgba(0, 0, 0, 0.2)" },
                  },
                }}
              >
                <BusinessOutlinedIcon sx={{ fontSize: 50, color: "white" }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", mt: 0.5, letterSpacing: 0.5 }}>
                Join NexGen Pharma QMS Platform
              </Typography>
            </Box>
          </Slide>

          <Grow in timeout={1100}>
            <Box sx={{ px: 4, py: 3 }}>
              {error && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#fee",
                    border: "1px solid #fcc",
                  }}
                >
                  <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <TextField
                  label="Username"
                  placeholder="jdoe24"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#fafbfc",
                      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#667eea" },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": { borderWidth: "2px" },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": { color: "#667eea" },
                    },
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#fafbfc",
                      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#667eea" },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": { borderWidth: "2px" },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": { color: "#667eea" },
                    },
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#fafbfc",
                      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#667eea" },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": { borderWidth: "2px" },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": { color: "#667eea" },
                    },
                  }}
                />

                <Box>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: "#94a3b8",
                              transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                              "&:hover": { 
                                color: "#667eea", 
                                transform: "scale(1.1)",
                                bgcolor: "rgba(102, 126, 234, 0.08)",
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#fafbfc",
                        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        "&:hover": { 
                          transform: "translateY(-2px)",
                          bgcolor: "#ffffff",
                          "& fieldset": { borderColor: "#667eea" },
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          bgcolor: "#ffffff",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                          "& fieldset": { borderWidth: "2px" },
                        },
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 600,
                        "&.Mui-focused": { color: "#667eea" },
                      },
                    }}
                  />
                  {password && (
                    <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#e2e8f0",
                          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: getStrengthColor(),
                            borderRadius: 4,
                            transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: getStrengthColor(),
                          fontWeight: 700,
                          minWidth: 50,
                          fontSize: "0.75rem",
                        }}
                      >
                        {getStrengthLabel()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  fullWidth
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={confirm.length > 0 && password !== confirm}
                  helperText={
                    confirm.length > 0 && password !== confirm
                      ? "Passwords do not match"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm(!showConfirm)}
                          edge="end"
                          sx={{
                            color: "#94a3b8",
                            transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                            "&:hover": { 
                              color: "#667eea", 
                              transform: "scale(1.1)",
                              bgcolor: "rgba(102, 126, 234, 0.08)",
                            },
                          }}
                        >
                          {showConfirm ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#fafbfc",
                      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#667eea" },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": { borderWidth: "2px" },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": { color: "#667eea" },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    background: loading
                      ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      transition: "left 0.5s",
                    },
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.5)",
                      "&::before": {
                        left: "100%",
                      },
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Typography
                      component="span"
                      onClick={() => navigate("/login")}
                      sx={{
                        color: "#667eea",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        "&:hover": { color: "#764ba2" },
                      }}
                    >
                      Sign In
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grow>

          <Fade in timeout={1200}>
            <Box sx={{ py: 2, textAlign: "center", bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
              <Typography variant="caption" color="text.secondary">
                © 2024 NexGen Pharma Solutions Pvt. Ltd.
              </Typography>
            </Box>
          </Fade>
        </Paper>
      </Fade>
    </Box>
  );
}