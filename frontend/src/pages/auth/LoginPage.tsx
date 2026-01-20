import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("qms_token", "demo");
    navigate("/", { replace: true });
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
          NexGen QMS
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Sign in to continue
        </Typography>

        <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
          <TextField label="Email" fullWidth />
          <TextField label="Password" type="password" fullWidth />

          <Button onClick={handleLogin} fullWidth variant="contained">
            Sign In (Dummy)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
