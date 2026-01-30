import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Sidebar from "./Sidebar";
import HeaderActions from "./HeaderActions";

const DRAWER_WIDTH = 280;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <CssBaseline />

      {/* --- SIDEBAR NAVIGATION --- */}
      <Box
        component="nav"
        sx={{ 
            width: { md: DRAWER_WIDTH }, 
            flexShrink: { md: 0 } 
        }}
      >
        {/* Mobile Drawer (Temporary) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { 
                boxSizing: "border-box", 
                width: DRAWER_WIDTH,
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* Desktop Sidebar (Permanent) */}
        <Box 
            sx={{ 
                display: { xs: "none", md: "block" },
                width: DRAWER_WIDTH,
                height: "100vh",
                // Sidebar component inside has sticky positioning, 
                // so we just provide the container
            }}
        >
           <Sidebar />
        </Box>
      </Box>

      {/* --- MAIN CONTENT AREA --- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Mobile Header Toggle */}
        <Box 
            sx={{ 
                display: { xs: "flex", md: "none" }, 
                alignItems: "center",
                p: 2, 
                bgcolor: "white", 
                borderBottom: "1px solid #f1f5f9" 
            }}
        >
           <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 2, color: "#64748b" }}>
             <MenuIcon />
           </IconButton>
        </Box>

        {/* Global Header */}
        <HeaderActions />

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, overflowX: "hidden" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}