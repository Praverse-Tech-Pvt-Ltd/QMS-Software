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
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../app/providers/RoleProvider";

const ROLES = ["Admin", "QA", "QC", "Production", "Warehouse"] as const;

export default function HeaderActions() {
  const navigate = useNavigate();
  const { role, setRole } = useRole();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    localStorage.removeItem("qms_token");
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        {/* Search */}
        <Box sx={{ flex: 1, maxWidth: 520 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search SOPs, CAPAs, or Tasks..."
            InputProps={{
              startAdornment: (
                <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.03)",
              },
            }}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Role Switcher */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              VIEW AS:
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                p: 0.5,
                bgcolor: "rgba(0,0,0,0.06)",
                borderRadius: 3,
              }}
            >
              {ROLES.map((r) => (
                <Chip
                  key={r}
                  label={`${r} Role`}
                  size="small"
                  clickable
                  onClick={() => setRole(r)}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: role === r ? "white" : "transparent",
                    boxShadow:
                      role === r
                        ? "0px 2px 8px rgba(0,0,0,0.12)"
                        : "none",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Notifications */}
          <IconButton>
            <Badge variant="dot" color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>

          {/* Messages */}
          <IconButton>
            <Badge badgeContent={3} color="primary">
              <ChatBubbleOutlineOutlinedIcon />
            </Badge>
          </IconButton>

          {/* Create Document */}
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              px: 2.5,
            }}
            onClick={() => navigate("/dms/new")}
          >
            Create Document
          </Button>

          {/* Profile */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircleOutlinedIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography variant="body2" fontWeight={700}>
                Logged in (Demo)
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
