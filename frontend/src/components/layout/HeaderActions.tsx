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
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import { transitions, shadows, motion } from "../../theme/motion";
import CreateDocumentModal from "../common/CreateDocumentModal";
import UserProfileCard from "../common/UserProfileCard";

const ROLES = ["Admin", "QA", "QC", "Production", "Warehouse", "Viewer"] as const;

function HeaderActions() {
  const { role, setRole } = useRole();
  const [scrolled, setScrolled] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Detect scroll for elevation effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // --- Menu States ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userOpen = Boolean(anchorEl);

  const [notifyAnchorEl, setNotifyAnchorEl] = useState<null | HTMLElement>(null);
  const notifyOpen = Boolean(notifyAnchorEl);

  // --- Handlers ---
  const handleUserMenuClose = useCallback(() => setAnchorEl(null), []);
  const handleNotifyMenuClose = useCallback(() => setNotifyAnchorEl(null), []);

  const canCreateDocument = useMemo(
    () => (role ? permissionService.can(role, "dms", "create") : false),
    [role]
  );

  const handleOpenCreateModal = useCallback(() => setCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setCreateModalOpen(false), []);

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

          <IconButton 
            size="small" 
            sx={{ 
              color: notifyOpen ? "#6366F1" : "#5C6370", 
              bgcolor: notifyOpen ? "#EEF2FF" : "transparent",
              transition: transitions.fast,
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
            onClick={(e) => setNotifyAnchorEl(e.currentTarget)}
          >
            <Badge variant="dot" color="error" overlap="circular">
               <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            size="small" 
            sx={{ color: "#5C6370", "&:hover": { bgcolor: "#F3F4F6" }}}
          >
            <Badge badgeContent={3} color="primary" overlap="circular">
              <ChatBubbleOutlineOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>

          {canCreateDocument && (
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpenCreateModal}
              sx={{ 
                bgcolor: "#667eea", 
                borderRadius: 2, 
                textTransform: "none", 
                fontWeight: 600, 
                display: { xs: "none", md: "flex" }, 
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)", 
                transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                "&:hover": { 
                  bgcolor: "#764ba2",
                  transform: "translateY(-2px)",
                } 
              }}
            >
              Create
            </Button>
          )}

           {/* User Profile Trigger */}
           <Box
             onClick={(e) => setAnchorEl(e.currentTarget)}
             sx={{
               display: "flex",
               alignItems: "center",
               gap: 1.5,
               ml: 1,
               px: 1.5,
               py: 0.75,
               borderRadius: 2,
               cursor: "pointer",
               border: "1px solid",
               borderColor: userOpen ? "#6366F1" : "#e2e8f0",
               bgcolor: userOpen ? "#f0f4ff" : "transparent",
               transition: transitions.fast,
               "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
             }}
           >
             <Avatar
               sx={{
                 width: 36,
                 height: 36,
                 bgcolor: "#667eea",
                 fontSize: "14px",
                 fontWeight: 600,
               }}
             >
               AP
             </Avatar>
             <Box sx={{ display: { xs: "none", lg: "block" } }}>
               <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                 Alexander Pierce
               </Typography>
               <Typography variant="caption" sx={{ color: "#64748b", display: "block", lineHeight: 1 }}>
                 Chief Quality Officer
               </Typography>
             </Box>
           </Box>

           <Menu
            anchorEl={anchorEl}
            open={userOpen}
            onClose={handleUserMenuClose}
            PaperProps={{ 
              elevation: 0, 
              sx: { overflow: 'visible', mt: 2, borderRadius: 3, background: 'transparent' } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <UserProfileCard
              userName="Alexander Pierce"
              userRole="Chief Quality Officer"
              userInitials="AP"
              tasksCount={12}
              pendingCount={8}
              approvedCount={32}
              onClose={handleUserMenuClose}
            />
          </Menu>

          {/* Notification Menu */}
          <Menu
            anchorEl={notifyAnchorEl}
            open={notifyOpen}
            onClose={handleNotifyMenuClose}
            PaperProps={{ 
              elevation: 16, 
              sx: { width: 360, maxHeight: 480, mt: 1.5, borderRadius: 3, border: "1px solid #E9ECEF" } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E9ECEF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
              <Chip label="2 New" size="small" sx={{ bgcolor: "#FEE2E2", color: "#DC2626", fontWeight: 600 }} />
            </Box>

            <List disablePadding>
              <MenuItem sx={{ py: 2, px: 3, gap: 1.5, whiteSpace: "normal" }}>
                 <Avatar sx={{ bgcolor: "#EEF2FF", color: "#6366F1", width: 36, height: 36 }}>
                   <AssignmentIndOutlinedIcon fontSize="small" />
                 </Avatar>
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>New SOP Assigned</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>SOP-QA-001 requires review.</Typography>
                 </Box>
              </MenuItem>
              <Divider component="li" />
              <MenuItem sx={{ py: 2, px: 3, gap: 1.5, whiteSpace: "normal" }}>
                 <Avatar sx={{ bgcolor: "#FEF3C7", color: "#B45309", width: 36, height: 36 }}>
                   <WarningAmberRoundedIcon fontSize="small" />
                 </Avatar>
                 <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Audit Reminder</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>Internal audit starts in 3 days.</Typography>
                 </Box>
              </MenuItem>
            </List>
            
            <Box sx={{ p: 2, borderTop: "1px solid #E9ECEF", textAlign: "center" }}>
              <Button size="small" fullWidth sx={{ textTransform: "none", fontWeight: 600 }}>
                View All Notifications
              </Button>
            </Box>
          </Menu>

        </Box>
      </Box>

      <CreateDocumentModal open={createModalOpen} onClose={handleCloseCreateModal} />
    </Box>
  );
}

export default React.memo(HeaderActions);