import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./sidebarConfig";
import { useRole } from "../../app/providers/RoleProvider";
import { rolePermissions } from "../../types/permissions";
import { useMemo, useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Sidebar() {
  const { role } = useRole();
  const allowed = rolePermissions[role];

  const location = useLocation();
  const navigate = useNavigate();

  const filteredNav = useMemo(() => {
    // filter based on allowed keys (including children)
    return navItems
      .filter((item) => allowed.includes(item.key))
      .map((item) => {
        if (!item.children) return item;

        const filteredChildren = item.children.filter((c) =>
          allowed.includes(c.key),
        );

        return {
          ...item,
          children: filteredChildren,
        };
      });
  }, [allowed]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    training: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
          {filteredNav.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            const hasChildren = !!item.children && item.children.length > 0;

            return (
              <Box key={item.path}>
                <ListItemButton
                  onClick={() => {
                    // ✅ Parent row always navigates
                    navigate(item.path);
                  }}
                  selected={
                    isActive &&
                    !location.pathname.startsWith("/training/matrix")
                  }
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

                  {hasChildren ? (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ prevents navigation
                        toggleGroup(item.key);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 0.5,
                        cursor: "pointer",
                      }}
                    >
                      {openGroups[item.key] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </Box>
                  ) : null}
                </ListItemButton>

                {hasChildren && (
                  <Collapse
                    in={openGroups[item.key]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List dense sx={{ pl: 2 }}>
                      {item.children!.map((child) => {
                        const childActive =
                          location.pathname === child.path ||
                          location.pathname.startsWith(child.path);

                        return (
                          <ListItemButton
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            selected={childActive}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              "&.Mui-selected": {
                                bgcolor: "rgba(31, 111, 235, 0.10)",
                                "&:hover": {
                                  bgcolor: "rgba(31, 111, 235, 0.14)",
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 42 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText primary={child.label} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          UI only • Sprint Build
        </Typography>
      </Box>
    </Box>
  );
}
