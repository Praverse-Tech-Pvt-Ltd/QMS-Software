import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import { useState } from "react";
import PaletteIcon from "@mui/icons-material/Palette";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";

export default function AppearancePreferences() {
  const [preferences, setPreferences] = useState({
    darkMode: false,
    denseView: false,
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <PaletteIcon sx={{ fontSize: 32, color: "#ec4899" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Appearance Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your viewing experience
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        These settings apply only to your account and do not affect other users.
      </Alert>

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DarkModeIcon sx={{ color: "#6366f1" }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Dark Mode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Switch between light and dark color themes
            </Typography>
          </Box>
          <Switch
            checked={preferences.darkMode}
            onChange={(e) =>
              setPreferences({ ...preferences, darkMode: e.target.checked })
            }
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DensityMediumIcon sx={{ color: "#10b981" }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Dense View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Show more content with reduced spacing
            </Typography>
          </Box>
          <Switch
            checked={preferences.denseView}
            onChange={(e) =>
              setPreferences({ ...preferences, denseView: e.target.checked })
            }
          />
        </Box>
      </Paper>
    </Box>
  );
}
