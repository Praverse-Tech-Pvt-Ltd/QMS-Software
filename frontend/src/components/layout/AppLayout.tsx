import { Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  Avatar,
  CssBaseline
} from "@mui/material";
import Sidebar from "./Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

// ✅ Import New Components
import GlobalSearch from "../common/GlobalSearch";
import NotificationMenu from "../common/NotificationMenu";
import { useRole } from "../../app/providers/RoleProvider";

const drawerWidth = 260;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // ✅ Search State
  const { role } = useRole();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawer = <Sidebar />;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={800} noWrap component="div" sx={{ flexGrow: 1 }}>
             Quality Management System
          </Typography>

          {/* ✅ 1. GLOBAL SEARCH TRIGGER */}
          <Tooltip title="Search (Ctrl+K)">
            <IconButton onClick={() => setSearchOpen(true)} sx={{ mr: 1 }}>
                <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* ✅ 2. NOTIFICATION MENU */}
          <Box sx={{ mr: 2 }}>
            <NotificationMenu />
          </Box>

          {/* ✅ 3. USER PROFILE */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
             <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={700}>John Doe</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {role}
                </Typography>
             </Box>
             <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>JD</Avatar>
          </Box>

        </Toolbar>
      </AppBar>

      {/* Sidebar (Desktop) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0,0,0,0.08)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#f4f6f8',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>

      {/* ✅ 4. RENDER SEARCH DIALOG */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}