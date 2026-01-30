import { 
  Menu, MenuItem, ListItemText, Typography, Box, Badge, IconButton, Divider, Button 
} from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { useState } from "react";

const NOTIFICATIONS = [
    { id: 1, text: "Approval Requested: SOP-005", time: "10 mins ago", unread: true },
    { id: 2, text: "Training Overdue: GMP Refresher", time: "2 hours ago", unread: true },
    { id: 3, text: "Deviation DEV-042 Assigned to You", time: "Yesterday", unread: false },
];

export default function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 320, maxHeight: 400, mt: 1.5 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={800}>Notifications</Typography>
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>Mark all read</Typography>
        </Box>
        <Divider />
        
        {NOTIFICATIONS.map((notif) => (
            <MenuItem key={notif.id} onClick={() => setAnchorEl(null)} sx={{ py: 1.5, px: 2, gap: 1.5, whiteSpace: 'normal' }}>
                <CircleIcon sx={{ fontSize: 10, color: notif.unread ? 'primary.main' : 'transparent' }} />
                <ListItemText 
                    primary={<Typography variant="body2" fontWeight={notif.unread ? 700 : 400}>{notif.text}</Typography>}
                    secondary={notif.time}
                />
            </MenuItem>
        ))}
        
        <Divider />
        <Button fullWidth onClick={() => setAnchorEl(null)}>View All</Button>
      </Menu>
    </>
  );
}