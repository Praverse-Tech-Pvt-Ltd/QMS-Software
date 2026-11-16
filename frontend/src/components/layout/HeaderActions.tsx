import { Box, Button, IconButton, Typography, Badge, Menu, MenuItem, Select, Avatar, Divider, List, Tooltip } from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import React, { useState, useCallback, useMemo, type ReactNode } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService, type UserRole } from "../../services/permission.service";
import { authService } from "../../services/auth.service";
import CreateDocumentModal from "../common/CreateDocumentModal";
import UserProfileCard from "../common/UserProfileCard";
import { color, transition } from "../../theme/tokens";

const ROLES = ["Admin", "QA", "QC", "Production", "Warehouse", "Viewer"] as const;

const selectSx = {
  fontSize: "0.8125rem",
  color: color.ink,
  "& .MuiSelect-select": { py: "5px", pl: 1, pr: "28px !important" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color.border },
  bgcolor: "transparent",
};

function initialsOf(name: string) {
  const parts = name.replace(/[^a-zA-Z ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function HeaderActions({ menuButton }: { menuButton?: ReactNode }) {
  const { role, setRole, siteId, setSiteId, sites } = useRole();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifyAnchorEl, setNotifyAnchorEl] = useState<null | HTMLElement>(null);
  const userOpen = Boolean(anchorEl);
  const notifyOpen = Boolean(notifyAnchorEl);

  const handleUserMenuClose = useCallback(() => setAnchorEl(null), []);
  const handleNotifyMenuClose = useCallback(() => setNotifyAnchorEl(null), []);

  const canCreateDocument = useMemo(() => (role ? permissionService.can(role, "dms", "create") : false), [role]);

  // Signed-in identity (set at login/signup). Falls back gracefully if missing.
  const storedUser = authService.getUser() as { email?: string; name?: string } | null;
  const displayName = storedUser?.name && storedUser.name !== "QMS User" ? storedUser.name : storedUser?.email || "Signed in";

  const openSearch = () => window.dispatchEvent(new Event("qms:open-command-palette"));

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: { xs: 1.5, md: 3 },
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: `1px solid ${color.border}`,
        bgcolor: color.surface,
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {menuButton}

      {/* Search: opens the command palette */}
      <Box
        component="button"
        type="button"
        onClick={openSearch}
        aria-label="Search or jump to (Ctrl+K)"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flex: 1,
          maxWidth: 420,
          height: 34,
          px: 1.25,
          border: `1px solid ${color.border}`,
          borderRadius: "6px",
          bgcolor: color.canvas,
          color: color.textMuted,
          font: "inherit",
          fontSize: "0.8125rem",
          cursor: "pointer",
          textAlign: "left",
          transition: transition(),
          "&:hover": { borderColor: color.borderStrong, color: color.textSecondary },
        }}
      >
        <SearchOutlinedIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Search or jump to…
        </Box>
        <Box
          component="kbd"
          sx={{
            display: { xs: "none", sm: "inline-block" },
            px: 0.75,
            py: "1px",
            border: `1px solid ${color.border}`,
            borderRadius: "4px",
            bgcolor: color.surface,
            fontFamily: "inherit",
            fontSize: "0.6875rem",
            color: color.textMuted,
          }}
        >
          Ctrl K
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
        {sites.length > 0 && (
          <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.25 }}>
            <BusinessOutlinedIcon sx={{ color: color.textMuted, fontSize: 18 }} aria-hidden />
            <Select
              size="small"
              value={siteId ?? ""}
              displayEmpty
              onChange={(e) => setSiteId(e.target.value ? String(e.target.value) : null)}
              inputProps={{ "aria-label": "Site" }}
              IconComponent={ExpandMoreIcon}
              sx={{ ...selectSx, maxWidth: 200 }}
            >
              <MenuItem value="">All sites</MenuItem>
              {sites.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.code} · {s.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {/* Role preview (demo/testing aid): compact select instead of six chips */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, pr: 1, mr: 0.5, borderRight: `1px solid ${color.border}` }}>
          <Typography component="label" htmlFor="view-as-role" sx={{ fontSize: "0.75rem", color: color.textMuted, whiteSpace: "nowrap" }}>
            View as
          </Typography>
          <Select
            size="small"
            value={role ?? ""}
            onChange={(e) => setRole(e.target.value as UserRole)}
            inputProps={{ id: "view-as-role" }}
            IconComponent={ExpandMoreIcon}
            sx={{ ...selectSx, fontWeight: 600 }}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Tooltip title="Notifications">
          <IconButton aria-label="Notifications" onClick={(e) => setNotifyAnchorEl(e.currentTarget)} sx={notifyOpen ? { bgcolor: color.accentSoft, color: color.accent } : undefined}>
            <Badge variant="dot" color="error" overlap="circular">
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {canCreateDocument && (
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateModalOpen(true)} sx={{ display: { xs: "none", md: "inline-flex" }, ml: 0.5 }}>
            New record
          </Button>
        )}

        <Box
          component="button"
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={userOpen}
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            ml: 0.5,
            pl: 0.5,
            pr: 1,
            height: 36,
            border: "1px solid transparent",
            borderRadius: "6px",
            bgcolor: userOpen ? color.canvas : "transparent",
            font: "inherit",
            cursor: "pointer",
            transition: transition(),
            "&:hover": { bgcolor: color.canvas, borderColor: color.border },
          }}
        >
          <Avatar sx={{ width: 28, height: 28, bgcolor: color.accentSoft, color: color.accent, fontSize: "0.75rem", fontWeight: 600 }}>
            {initialsOf(displayName)}
          </Avatar>
          <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left", minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: color.ink, lineHeight: 1.2, maxWidth: 160 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: color.textMuted, lineHeight: 1.2 }}>{role ?? ""}</Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={userOpen}
          onClose={handleUserMenuClose}
          slotProps={{ paper: { elevation: 0, sx: { overflow: "visible", mt: 1, border: 0, background: "transparent" } } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <UserProfileCard
            userName={displayName}
            userRole={role ?? ""}
            userInitials={initialsOf(displayName)}
            tasksCount={12}
            pendingCount={8}
            approvedCount={32}
            onClose={handleUserMenuClose}
          />
        </Menu>

        <Menu
          anchorEl={notifyAnchorEl}
          open={notifyOpen}
          onClose={handleNotifyMenuClose}
          slotProps={{ paper: { elevation: 8, sx: { width: 340, maxHeight: 460, mt: 1 } } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="caption">2 unread</Typography>
          </Box>
          <Divider />
          <List disablePadding>
            <MenuItem sx={{ py: 1.25, px: 2, gap: 1.5, whiteSpace: "normal", alignItems: "flex-start" }}>
              <AssignmentIndOutlinedIcon sx={{ fontSize: 18, mt: "2px", color: color.accent }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">New SOP assigned</Typography>
                <Typography variant="body2">SOP-QA-001 requires review.</Typography>
              </Box>
            </MenuItem>
            <MenuItem sx={{ py: 1.25, px: 2, gap: 1.5, whiteSpace: "normal", alignItems: "flex-start" }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 18, mt: "2px", color: color.warning }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Audit reminder</Typography>
                <Typography variant="body2">Internal audit starts in 3 days.</Typography>
              </Box>
            </MenuItem>
          </List>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button size="small" fullWidth>
              View all notifications
            </Button>
          </Box>
        </Menu>
      </Box>

      <CreateDocumentModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </Box>
  );
}

export default React.memo(HeaderActions);
