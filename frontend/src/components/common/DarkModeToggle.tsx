import { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { transitions } from "../../theme/motion";

/**
 * Dark Mode Toggle Component
 * Foundation for theme switching with smooth transitions
 * 
 * To fully implement dark mode:
 * 1. Update theme.ts to include dark mode palette
 * 2. Use ThemeProvider with dynamic theme switching
 * 3. Store preference in localStorage
 */

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    // Save preference
    localStorage.setItem("darkMode", isDark.toString());

    // Apply to document root for CSS variables
    if (isDark) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={handleToggle}
        sx={{
          transition: transitions.button.default,
          "&:hover": {
            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            transform: "rotate(20deg)",
          },
          "&:active": {
            transform: "rotate(0deg)",
          },
        }}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ color: "#FDB813" }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ color: "#5C6370" }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
