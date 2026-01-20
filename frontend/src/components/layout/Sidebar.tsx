import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./sidebarConfig";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          NexGen QMS
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.3, color: "text.secondary" }}>
          Pharma Solutions Pvt. Ltd.
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 1 }}>
        <List dense>
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(31, 111, 235, 0.10)",
                    "&:hover": { bgcolor: "rgba(31, 111, 235, 0.14)" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          UI only • Week-1 Sprint
        </Typography>
      </Box>
    </Box>
  );
}
