import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  TextField, 
  InputAdornment 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from "react";

// Mock User Data
const MOCK_USERS = [
  { id: 'u1', name: 'Alice Smith', role: 'QA Manager' },
  { id: 'u2', name: 'Bob Jones', role: 'Production Lead' },
  { id: 'u3', name: 'Charlie Day', role: 'Quality Control' },
  { id: 'u4', name: 'Dana White', role: 'Operations' },
];

interface UserSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: { id: string; name: string; role: string }) => void;
  title?: string;
}

export default function UserSelectionModal({ 
  open, 
  onClose, 
  onSelect, 
  title = "Select User" 
}: UserSelectionModalProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Search by name or role..."
          fullWidth
          size="small"
          variant="outlined"
          sx={{ mb: 2, mt: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 2 }}>
          {filteredUsers.map((user) => (
            <ListItem 
              component="button"
              key={user.id} 
              onClick={() => { onSelect(user); onClose(); }}
              sx={{ cursor: 'pointer', textAlign: 'left' }}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd', color: '#1976d2' }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={user.name} 
                secondary={user.role} 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
          {filteredUsers.length === 0 && (
            <ListItem>
                <ListItemText secondary="No users found" sx={{ textAlign: 'center' }} />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}