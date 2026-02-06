import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Badge,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Avatar,
  Divider,
  List,
  
} from "@mui/material";

// Icons
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import { transitions, shadows, motion } from "../../theme/motion";

const ROLES = ["Admin", "QA", "QC", "Production", "Warehouse", "Viewer"] as const;

export default function HeaderActions() {
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const [scrolled, setScrolled] = useState(false);
  
  // Detect scroll for elevation effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // --- User Menu State ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userOpen = Boolean(anchorEl);

  // --- Notification Menu State ---
  const [notifyAnchorEl, setNotifyAnchorEl] = useState<null | HTMLElement>(null);
  const notifyOpen = Boolean(notifyAnchorEl);

  // --- Handlers ---
  const handleUserMenuClose = () => setAnchorEl(null);
  const handleNotifyMenuClose = () => setNotifyAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("qms_token");
    navigate("/login", { replace: true });
  };

  // ✅ Fix: Check if role exists before checking permissions
  const canCreateDocument = role ? permissionService.can(role, "dms", "create") : false;

  return (
    <Box 
      sx={{ 
        px: 3, 
        py: 1.5, 
        borderBottom: "1px solid #E9ECEF", 
        bgcolor: "#FFFFFF", 
        position: "sticky", 
        top: 0, 
        zIndex: 1100,
        transition: transitions.fast,
        boxShadow: scrolled ? shadows.card : "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        
        {/* Search Bar */}
        <Box sx={{ flex: 1, maxWidth: 500, display: { xs: "none", sm: "block" } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search documents, records, and more..."
            sx={{ 
              "& .MuiOutlinedInput-root": { 
                borderRadius: 2, 
                bgcolor: "#FAFBFC",
                transition: transitions.fast,
                "& fieldset": { borderColor: "#E9ECEF" }, 
                "&:hover fieldset": { borderColor: "#858D96" }, 
                "&.Mui-focused fieldset": { 
                  borderColor: "#6366F1", 
                  borderWidth: 2, 
                },
                "&.Mui-focused": {
                  bgcolor: "#FFFFFF",
                  boxShadow: shadows.subtle,
                },
              } 
            }}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: "#858D96", fontSize: 20 }} />
                </InputAdornment>
              ) 
            }}
          />
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
          
          {/* Role Switcher */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1, borderRight: "1px solid #E9ECEF", pr: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#858D96", whiteSpace: "nowrap", display: { xs: "none", md: "block"} }}>VIEW AS:</Typography>
            {ROLES.map((r) => (
              <Chip
                key={r}
                label={r}
                size="small"
                onClick={() => setRole(r as any)}
                variant={role === r ? "filled" : "outlined"}
                color={role === r ? "primary" : "default"}
                sx={{ 
                  fontWeight: 600, 
                  borderRadius: 1.5, 
                  height: 28, 
                  borderColor: "#DFE2E6", 
                  bgcolor: role === r ? "#EEF2FF" : "#FFFFFF", 
                  color: role === r ? "#6366F1" : "#5C6370",
                  transition: transitions.fast,
                  cursor: "pointer",
                  "&:hover": { 
                    bgcolor: "#F3F4F6",
                    transform: `translateY(-${motion.distance.micro}px)`,
                  },
                }}
              />
            ))}
          </Box>

          {/* ✅ NOTIFICATIONS ICON (Now Functional) */}
          <IconButton 
            size="small" 
            sx={{ 
              color: notifyOpen ? "#6366F1" : "#5C6370", 
              bgcolor: notifyOpen ? "#EEF2FF" : "transparent",
              transition: transitions.fast,
              "&:hover": {
                bgcolor: "#F3F4F6",
                transform: `translateY(-${motion.distance.micro}px)`,
              },
            }}
            onClick={(e) => setNotifyAnchorEl(e.currentTarget)}
          >
            <Badge variant="dot" color="error" overlap="circular">
               <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
          
          {/* Messages Icon */}
          <IconButton 
            size="small" 
            sx={{ 
              color: "#5C6370",
              "&:hover": {
                bgcolor: "#F3F4F6",
              }
            }}
          >
            <Badge badgeContent={3} color="primary" overlap="circular">
              <ChatBubbleOutlineOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>

          {/* Create Button */}
          {canCreateDocument && (
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => navigate("/dms/new")}
              sx={{ 
                bgcolor: "#6366F1", 
                borderRadius: 2, 
                textTransform: "none", 
                fontWeight: 600, 
                display: { xs: "none", md: "flex" }, 
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", 
                "&:hover": { 
                  bgcolor: "#4F46E5",
                  boxShadow: "0 4px 8px rgba(31, 111, 235, 0.25)",
                } 
              }}
            >
              Create
            </Button>
          )}

           {/* User Profile */}
           <IconButton 
             onClick={(e) => setAnchorEl(e.currentTarget)} 
             sx={{ 
               ml: 0.5, 
               color: "#5C6370",
               "&:hover": {
                 bgcolor: "#F3F4F6",
               }
             }}
           >
             <AccountCircleOutlinedIcon />
           </IconButton>

           {/* --- USER MENU --- */}
           <Menu
            anchorEl={anchorEl}
            open={userOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{ 
              elevation: 16, 
              sx: { 
                overflow: 'visible', 
                mt: 1.5, 
                borderRadius: 3, 
                minWidth: 200, 
                border: "1px solid #E9ECEF",
                boxShadow: "0 16px 32px -8px rgba(0, 0, 0, 0.2)",
              } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} color="#2D3339">Alexander Pierce</Typography>
              <Typography variant="caption" color="#858D96">Chief Quality Officer</Typography>
            </Box>
            <Divider sx={{ borderColor: "#E9ECEF" }} />
            <MenuItem 
              onClick={() => navigate("/settings")} 
              sx={{ 
                py: 1.5, 
                px: 2.5,
                "&:hover": { bgcolor: "#F3F4F6" }
              }}
            >
              <Avatar sx={{ width: 24, height: 24, mr: 1.5, bgcolor: "transparent", color: "#5C6370" }} /> 
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: "#DC2626", 
                py: 1.5, 
                px: 2.5,
                "&:hover": { bgcolor: "#FEE2E2" }
              }}
            >
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} /> 
              Sign Out
            </MenuItem>
          </Menu>

          {/* --- ✅ NOTIFICATION MENU --- */}
          <Menu
            anchorEl={notifyAnchorEl}
            open={notifyOpen}
            onClose={handleNotifyMenuClose}
            onClick={handleNotifyMenuClose}
            PaperProps={{ 
              elevation: 16, 
              sx: { 
                width: 360, 
                maxHeight: 480, 
                overflowY: 'auto', 
                mt: 1.5, 
                borderRadius: 3, 
                border: "1px solid #E9ECEF",
                boxShadow: "0 16px 32px -8px rgba(0, 0, 0, 0.2)",
              } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E9ECEF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={600} color="#2D3339">Notifications</Typography>
              <Chip 
                label="2 New" 
                size="small" 
                sx={{ 
                  height: 22, 
                  fontSize: "0.7rem", 
                  fontWeight: 600, 
                  bgcolor: "#FEE2E2", 
                  color: "#DC2626", 
                  border: "1px solid #FCA5A5",
                }} 
              />
            </Box>

            <List disablePadding>
              <MenuItem sx={{ py: 2.5, px: 3, alignItems: "flex-start", gap: 1.5, whiteSpace: "normal", "&:hover": { bgcolor: "#FAFBFC" } }}>
                 <Avatar sx={{ bgcolor: "#EEF2FF", color: "#6366F1", width: 36, height: 36 }}>
                   <AssignmentIndOutlinedIcon fontSize="small" />
                 </Avatar>
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} color="#2D3339" sx={{ mb: 0.5 }}>New SOP Assigned</Typography>
                    <Typography variant="body2" color="#5C6370" sx={{ fontSize: "0.813rem" }}>SOP-QA-001 requires your review.</Typography>
                    <Typography variant="caption" display="block" color="#858D96" sx={{ mt: 0.75 }}>2 hours ago</Typography>
                 </Box>
              </MenuItem>
              <Divider component="li" sx={{ borderColor: "#F3F4F6" }} />
              <MenuItem sx={{ py: 2.5, px: 3, alignItems: "flex-start", gap: 1.5, whiteSpace: "normal", "&:hover": { bgcolor: "#FAFBFC" } }}>
                 <Avatar sx={{ bgcolor: "#FEF3C7", color: "#B45309", width: 36, height: 36 }}>
                   <WarningAmberRoundedIcon fontSize="small" />
                 </Avatar>
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} color="#2D3339" sx={{ mb: 0.5 }}>Audit Reminder</Typography>
                    <Typography variant="body2" color="#5C6370" sx={{ fontSize: "0.813rem" }}>Quarterly internal audit starts in 3 days.</Typography>
                    <Typography variant="caption" display="block" color="#858D96" sx={{ mt: 0.75 }}>5 hours ago</Typography>
                 </Box>
              </MenuItem>
            </List>
            
            <Box sx={{ p: 2, borderTop: "1px solid #E9ECEF", textAlign: "center", bgcolor: "#FAFBFC" }}>
              <Button 
                size="small" 
                fullWidth 
                sx={{ 
                  textTransform: "none", 
                  fontWeight: 600, 
                  color: "#6366F1", 
                  "&:hover": {
                    bgcolor: "#EEF2FF", 
                  }
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </Menu>

        </Box>
      </Box>
    </Box>
  );
}