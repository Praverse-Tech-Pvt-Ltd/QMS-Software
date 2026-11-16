import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import HeaderActions from "./HeaderActions";
import CommandPalette from "../common/CommandPalette";
import LoadingBar, { useLoadingBar } from "../common/LoadingBar";
import { color } from "../../theme/tokens";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loadingBar = useLoadingBar();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: color.canvas }}>
      <LoadingBar isLoading={loadingBar.isLoading} />
      <CommandPalette />

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: 0 } }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Desktop: fixed rail */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: `1px solid ${color.border}`,
        }}
      >
        <Sidebar />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <HeaderActions
          menuButton={
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          }
        />

        <Box sx={{ flexGrow: 1, px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1600, width: "100%", mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
