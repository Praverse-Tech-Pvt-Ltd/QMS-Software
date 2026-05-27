import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Sidebar from "./Sidebar";
import HeaderActions from "./HeaderActions";
import CommandPalette from "../common/CommandPalette";
import LoadingBar, { useLoadingBar } from "../common/LoadingBar";
import ClickSpark from "../common/ClickSpark";

const DRAWER_WIDTH = 280;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loadingBar = useLoadingBar();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ClickSpark
      sparkColor="#667eea"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
      easing="ease-out"
      extraScale={1.2}
    >
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F8FA" }}>
        <CssBaseline />

        {/* Global Components */}
        <LoadingBar isLoading={loadingBar.isLoading} />
        <CommandPalette />

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
                bgcolor: "#FAFBFC",
                borderRight: "1px solid #E9ECEF",
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
                bgcolor: "#FAFBFC",
                borderRight: "1px solid #E9ECEF",
                position: "fixed",
                top: 0,
                left: 0,
                overflowY: "auto",
                overflowX: "hidden",
                zIndex: 1000,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#CBD5E0",
                  borderRadius: "3px",
                  "&:hover": {
                    bgcolor: "#A0AEC0",
                  },
                },
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
                bgcolor: "#FFFFFF", 
                borderBottom: "1px solid #E9ECEF",
            }}
        >
           <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
             <MenuIcon />
           </IconButton>
        </Box>

        {/* Global Header */}
        <HeaderActions />

        {/* Page Content */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowX: "hidden",
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: "1600px",
          mx: "auto",
          width: "100%",
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
    </ClickSpark>
  );
}