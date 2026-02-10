import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import BugReportIcon from "@mui/icons-material/BugReport";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { motion, transitions } from "../../theme/motion";

/**
 * Command Palette (Cmd+K / Ctrl+K)
 * Global search and navigation - inspired by Linear, Vercel, GitHub
 */

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: "navigation" | "action" | "recent";
  keywords?: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Command items
  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Dashboard",
        description: "Go to dashboard",
        icon: <DashboardIcon />,
        category: "navigation",
        action: () => {
          navigate("/");
          setOpen(false);
        },
        keywords: ["home", "overview"],
      },
      {
        id: "nav-dms",
        title: "Document Management",
        description: "Browse documents",
        icon: <DescriptionIcon />,
        category: "navigation",
        action: () => {
          navigate("/dms");
          setOpen(false);
        },
        keywords: ["docs", "files", "documents"],
      },
      {
        id: "nav-deviations",
        title: "Deviations",
        description: "View deviations",
        icon: <BugReportIcon />,
        category: "navigation",
        action: () => {
          navigate("/deviations");
          setOpen(false);
        },
        keywords: ["issues", "problems", "nonconformance"],
      },
      {
        id: "nav-capa",
        title: "CAPA",
        description: "Corrective & Preventive Actions",
        icon: <AssessmentIcon />,
        category: "navigation",
        action: () => {
          navigate("/capa");
          setOpen(false);
        },
        keywords: ["corrective", "preventive", "actions"],
      },
      {
        id: "nav-change",
        title: "Change Control",
        description: "Manage change requests",
        icon: <ChangeCircleIcon />,
        category: "navigation",
        action: () => {
          navigate("/change-control");
          setOpen(false);
        },
        keywords: ["changes", "modifications"],
      },
      {
        id: "nav-training",
        title: "Training",
        description: "Training management",
        icon: <SchoolIcon />,
        category: "navigation",
        action: () => {
          navigate("/training");
          setOpen(false);
        },
        keywords: ["learning", "courses", "education"],
      },
      {
        id: "nav-settings",
        title: "Settings",
        description: "Application settings",
        icon: <SettingsIcon />,
        category: "navigation",
        action: () => {
          navigate("/settings");
          setOpen(false);
        },
        keywords: ["preferences", "config", "configuration"],
      },
    ],
    [navigate]
  );

  // Fuzzy search
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(lowerQuery);
      const matchDesc = cmd.description?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some((k) => k.includes(lowerQuery));
      return matchTitle || matchDesc || matchKeywords;
    });
  }, [query, commands]);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        setQuery("");
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <TextField
            fullWidth
            autoFocus
            placeholder="Search or jump to..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Box>

        {/* Results */}
        <List sx={{ maxHeight: 400, overflow: "auto", p: 1 }}>
          {filteredCommands.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No results found for "{query}"
              </Typography>
            </Box>
          ) : (
            filteredCommands.map((cmd, index) => (
              <ListItem
                key={cmd.id}
                onClick={cmd.action}
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  mb: 0.5,
                  transition: transitions.button.default,
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                    transform: `translateX(${motion.distance.micro}px)`,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                  {cmd.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      {cmd.title}
                    </Typography>
                  }
                  secondary={
                    cmd.description && (
                      <Typography variant="caption" color="text.secondary">
                        {cmd.description}
                      </Typography>
                    )
                  }
                />
                {index === 0 && (
                  <Chip
                    label="↵"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: "rgba(0,0,0,0.05)",
                    }}
                  />
                )}
              </ListItem>
            ))
          )}
        </List>

        {/* Footer hint */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            gap: 2,
            bgcolor: "#FAFBFC",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <Chip
              label="↵"
              size="small"
              sx={{ height: 18, fontSize: "0.65rem", mr: 0.5 }}
            />
            to select
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Chip
              label="ESC"
              size="small"
              sx={{ height: 18, fontSize: "0.65rem", mr: 0.5 }}
            />
            to close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
