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
  Fade,
  Slide,
  Grow,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Architecture Imports
import { authService } from "../../services/auth.service";
import { useRole } from "../../app/providers/RoleProvider";
import { type UserRole } from "../../services/permission.service";

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
      setError("Invalid username or password");
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
            maxWidth: 420,
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
                py: 4,
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
                  width: 60,
                  height: 60,
                  mx: "auto",
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: 28,
                  fontWeight: 900,
                  display: "grid",
                  placeItems: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  animation: "pulse 3s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" },
                    "50%": { transform: "scale(1.05)", boxShadow: "0 12px 48px rgba(0, 0, 0, 0.2)" },
                  },
                }}
              >
                N
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", mt: 0.5, letterSpacing: 0.5 }}>
                Sign in to NexGen Pharma QMS
              </Typography>
            </Box>
          </Slide>

          <Grow in timeout={1100}>
            <Box sx={{ px: 4, py: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Username"
                  placeholder="e.g. admin"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                        "& fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": {
                          borderWidth: "2px",
                        },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": {
                        color: "#667eea",
                      },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
                        "& fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                      "&.Mui-focused": {
                        transform: "translateY(-2px)",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                        "& fieldset": {
                          borderWidth: "2px",
                        },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      "&.Mui-focused": {
                        color: "#667eea",
                      },
                    },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel
                    control={<Checkbox sx={{ color: "#667eea" }} />}
                    label={<Typography variant="body2" color="#64748b">Remember me</Typography>}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667eea",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": {
                        color: "#764ba2",
                      },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1,
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
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </Box>
            </Box>
          </Grow>

          <Fade in timeout={1200}>
            <Box sx={{ px: 4, pb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Typography
                  component="span"
                  onClick={() => navigate("/signup")}
                  sx={{
                    color: "#667eea",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    "&:hover": {
                      color: "#764ba2",
                    },
                  }}
                >
                  Create account
                </Typography>
              </Typography>
            </Box>
          </Fade>

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