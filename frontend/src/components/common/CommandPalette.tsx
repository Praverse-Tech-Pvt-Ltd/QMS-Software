import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  alpha,
  Fade,
  Zoom,
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
  color?: string;
  gradient?: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
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
        color: "#667eea",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        color: "#4facfe",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
        color: "#f5576c",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
        color: "#fa709a",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
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
        color: "#a18cd1",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
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
        color: "#30cfd0",
        gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
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
        color: "#84fab0",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
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

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

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
      maxWidth="md"
      fullWidth
      TransitionComponent={Zoom}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          background: "#ffffff",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        
        {/* Search Input */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SearchIcon sx={{ color: "#667eea", fontSize: 28 }} />
            <TextField
              fullWidth
              autoFocus
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  "& fieldset": {
                    border: "none",
                  },
                  "& input::placeholder": {
                    color: "#94a3b8",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Results */}
        <List sx={{ maxHeight: 420, overflow: "auto", p: 2 }}>
          {filteredCommands.length === 0 ? (
            <Fade in timeout={300}>
              <Box
                sx={{
                  p: 6,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: alpha("#667eea", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SearchIcon sx={{ fontSize: 32, color: alpha("#667eea", 0.5) }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600} color="#1e293b" gutterBottom>
                    No results found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try searching for "{query}"
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ) : (
            filteredCommands.map((cmd, index) => (
              <Fade in timeout={200} key={cmd.id} style={{ transitionDelay: `${index * 30}ms` }}>
                <ListItem
                  onClick={cmd.action}
                  sx={{
                    borderRadius: 2.5,
                    cursor: "pointer",
                    mb: 1,
                    p: 2,
                    border: "2px solid transparent",
                    background: index === selectedIndex ? alpha(cmd.color || "#667eea", 0.08) : "transparent",
                    borderColor: index === selectedIndex ? alpha(cmd.color || "#667eea", 0.3) : "transparent",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      background: cmd.gradient || "#667eea",
                      opacity: index === selectedIndex ? 1 : 0,
                      transition: "opacity 0.2s ease",
                    },
                    "&:hover": {
                      background: alpha(cmd.color || "#667eea", 0.08),
                      borderColor: alpha(cmd.color || "#667eea", 0.3),
                      transform: "translateX(4px)",
                      boxShadow: `0 4px 12px ${alpha(cmd.color || "#667eea", 0.15)}`,
                      "&::before": {
                        opacity: 1,
                      },
                      "& .command-icon": {
                        background: cmd.gradient,
                        transform: "scale(1.1) rotate(5deg)",
                        "& svg": {
                          color: "#ffffff",
                        },
                      },
                      "& .command-arrow": {
                        opacity: 1,
                        transform: "translateX(0)",
                      },
                    },
                  }}
                >
                  <Box
                    className="command-icon"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: alpha(cmd.color || "#667eea", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      "& svg": {
                        color: cmd.color || "#667eea",
                        transition: "color 0.3s ease",
                      },
                    }}
                  >
                    {cmd.icon}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600} color="#1e293b">
                        {cmd.title}
                      </Typography>
                    }
                    secondary={
                      cmd.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {cmd.description}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              </Fade>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
