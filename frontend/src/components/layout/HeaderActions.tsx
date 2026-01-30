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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

const ROLES = ["Admin", "QA", "QC", "Production", "Warehouse", "Viewer"] as const;

export default function HeaderActions() {
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  
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

  const canCreateDocument = permissionService.can(role, "dms", "create");

  return (
    <Box sx={{ px: 3, py: 1.5, borderBottom: "1px solid #f1f5f9", bgcolor: "white", position: "sticky", top: 0, zIndex: 1100 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        
        {/* Search Bar */}
        <Box sx={{ flex: 1, maxWidth: 500, display: { xs: "none", sm: "block" } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#cbd5e1" }, "&.Mui-focused fieldset": { borderColor: "#3b82f6" } } }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
          />
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
          
          {/* Role Switcher */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1, borderRight: "1px solid #e2e8f0", pr: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", whiteSpace: "nowrap", display: { xs: "none", md: "block"} }}>VIEW AS:</Typography>
            {ROLES.map((r) => (
              <Chip
                key={r}
                label={r}
                size="small"
                onClick={() => setRole(r as any)}
                variant={role === r ? "filled" : "outlined"}
                color={role === r ? "primary" : "default"}
                sx={{ fontWeight: 600, borderRadius: 1.5, height: 28, borderColor: "#e2e8f0", bgcolor: role === r ? "#eff6ff" : "white", color: role === r ? "#1d4ed8" : "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
              />
            ))}
          </Box>

          {/* ✅ NOTIFICATIONS ICON (Now Functional) */}
          <IconButton 
            size="small" 
            sx={{ color: notifyOpen ? "#1e40af" : "#64748b", bgcolor: notifyOpen ? "#eff6ff" : "transparent" }}
            onClick={(e) => setNotifyAnchorEl(e.currentTarget)}
          >
            <Badge variant="dot" color="error" overlap="circular">
               <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
          
          {/* Messages Icon */}
          <IconButton size="small" sx={{ color: "#64748b" }}>
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
              sx={{ bgcolor: "#1e40af", borderRadius: 2, textTransform: "none", fontWeight: 700, display: { xs: "none", md: "flex" }, boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)", "&:hover": { bgcolor: "#1e3a8a" } }}
            >
              Create
            </Button>
          )}

           {/* User Profile */}
           <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5, color: "#475569" }}><AccountCircleOutlinedIcon /></IconButton>

           {/* --- USER MENU --- */}
           <Menu
            anchorEl={anchorEl}
            open={userOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))', mt: 1.5, borderRadius: 2, minWidth: 180, border: "1px solid #e2e8f0" } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>Alexander Pierce</Typography>
              <Typography variant="caption" color="text.secondary">Chief Quality Officer</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate("/settings")} sx={{ py: 1.5 }}><Avatar sx={{ width: 24, height: 24, mr: 1.5, bgcolor: "transparent", color: "#64748b" }} /> Profile</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "error.main", py: 1.5 }}><LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign Out</MenuItem>
          </Menu>

          {/* --- ✅ NOTIFICATION MENU --- */}
          <Menu
            anchorEl={notifyAnchorEl}
            open={notifyOpen}
            onClose={handleNotifyMenuClose}
            onClick={handleNotifyMenuClose}
            PaperProps={{ elevation: 0, sx: { width: 320, maxHeight: 400, overflowY: 'auto', filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.1))', mt: 1.5, borderRadius: 2, border: "1px solid #e2e8f0" } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={800}>Notifications</Typography>
              <Chip label="2 New" size="small" color="error" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
            </Box>

            <List disablePadding>
              <MenuItem sx={{ py: 2, alignItems: "flex-start", gap: 1.5, whiteSpace: "normal" }}>
                 <Avatar sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", width: 32, height: 32 }}><AssignmentIndOutlinedIcon fontSize="small" /></Avatar>
                 <Box>
                    <Typography variant="body2" fontWeight={600}>New SOP Assigned</Typography>
                    <Typography variant="caption" color="text.secondary">SOP-QA-001 requires your review.</Typography>
                    <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>2 hours ago</Typography>
                 </Box>
              </MenuItem>
              <Divider component="li" />
              <MenuItem sx={{ py: 2, alignItems: "flex-start", gap: 1.5, whiteSpace: "normal" }}>
                 <Avatar sx={{ bgcolor: "#fff7ed", color: "#c2410c", width: 32, height: 32 }}><WarningAmberRoundedIcon fontSize="small" /></Avatar>
                 <Box>
                    <Typography variant="body2" fontWeight={600}>Audit Reminder</Typography>
                    <Typography variant="caption" color="text.secondary">Quarterly internal audit starts in 3 days.</Typography>
                    <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>5 hours ago</Typography>
                 </Box>
              </MenuItem>
            </List>
            
            <Box sx={{ p: 1.5, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <Button size="small" fullWidth sx={{ textTransform: "none", fontWeight: 600 }}>View All Notifications</Button>
            </Box>
          </Menu>

        </Box>
      </Box>
    </Box>
  );
}