import { 
  Box, 
  Grid, // ✅ Use Grid2 for modern syntax
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar 
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import { useNavigate } from "react-router-dom";

// Configuration for all settings cards
const SETTINGS_SECTIONS = [
  {
    title: "Profile Settings",
    description: "Manage your personal information and preferences",
    icon: <PersonOutlineIcon color="primary" />,
    items: ["Personal Information", "Email Preferences", "Password & Security"],
    path: "/settings/profile"
  },
  {
    title: "Notification Settings",
    description: "Configure how you receive notifications",
    icon: <NotificationsNoneIcon color="primary" />,
    items: ["Email Notifications", "System Alerts", "Task Reminders"],
    path: "/settings/notifications"
  },
  {
    title: "Security & Access",
    description: "Manage security settings and access controls",
    icon: <SecurityIcon color="primary" />,
    items: ["Two-Factor Authentication", "Session Management", "API Keys"],
    path: "/settings/security"
  },
  {
    title: "System Configuration",
    description: "Configure system-wide settings and integrations",
    icon: <SettingsSuggestIcon color="primary" />,
    items: ["Document Templates", "Workflow Configuration", "Integration Settings"],
    path: "/settings/system"
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    icon: <GroupOutlinedIcon color="primary" />,
    items: ["User Accounts", "Role Assignments", "Access Permissions"],
    path: "/settings/users"
  },
  {
    title: "Organization Settings",
    description: "Configure organizational information and structure",
    icon: <BusinessIcon color="primary" />,
    items: ["Company Details", "Department Structure", "Site Management"],
    path: "/settings/organization"
  }
];

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
          Manage system configuration and preferences
        </Typography>
      </Box>

      {/* Settings Grid */}
      <Grid container spacing={3}>
        {SETTINGS_SECTIONS.map((section) => (
          // ✅ FIX: Use 'size' prop instead of 'item xs={12} md={6}'
          <Grid size={{ xs: 12, md: 6 }} key={section.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  borderColor: "#cbd5e1"
                }
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {/* Icon Box */}
                <Avatar
                  sx={{
                    bgcolor: "#eff6ff", // Light blue background
                    color: "#1d4ed8",   // Dark blue icon
                    width: 48,
                    height: 48,
                  }}
                >
                  {section.icon}
                </Avatar>

                {/* Title & Desc */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {section.description}
                  </Typography>
                </Box>
              </Box>

              {/* List Items */}
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItem 
                    key={item} 
                    disablePadding 
                    sx={{ 
                        mb: 1, 
                        cursor: "pointer",
                        "&:hover span": { color: "#2563eb", textDecoration: "underline" }
                    }}
                    onClick={() => console.log(`Navigating to ${item}`)}
                  >
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CircleIcon sx={{ fontSize: 6, color: "#2563eb" }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item} 
                      primaryTypographyProps={{ 
                        variant: "body2", 
                        color: "#334155",
                        fontWeight: 500
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}