import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSwitcher from "./RoleSwitcher";
import { authService } from "../../services/auth.service";

export default function HeaderActions() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    authService.logout(); // ✅
    handleClose();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <RoleSwitcher />

      <IconButton>
        <Badge badgeContent={3} color="primary">
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <IconButton onClick={handleOpen}>
        <AccountCircleOutlinedIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem disabled>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Logged in (Demo)
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
