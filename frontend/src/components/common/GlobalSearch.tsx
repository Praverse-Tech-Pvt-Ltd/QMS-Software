import { 
  Dialog, DialogContent, InputBase, Box, Typography, List, ListItem, 
  ListItemButton, ListItemText, Chip, IconButton 
} from "@mui/material"; // ✅ Added ListItemButton
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock Search Index
const MOCK_DATA = [
    { id: 'SOP-001', title: 'Hygiene Procedure', type: 'DMS', path: '/dms/SOP-001' },
    { id: 'SOP-005', title: 'Gowning Standards', type: 'DMS', path: '/dms/SOP-005' },
    { id: 'DEV-2024-042', title: 'Temp Excursion Autoclave', type: 'Deviation', path: '/deviations/DEV-2024-042' },
    { id: 'CAPA-009', title: 'Sensor Calibration Update', type: 'CAPA', path: '/capa/CAPA-009' },
    { id: 'CC-089', title: 'New Blender Install', type: 'Change', path: '/change-control/CC-089' },
];

export default function GlobalSearch({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = query.length < 2 ? [] : MOCK_DATA.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
      navigate(path);
      onClose();
  };

  const getIcon = (type: string) => {
      if (type === 'DMS') return <DescriptionIcon color="primary" />;
      if (type === 'Deviation') return <WarningIcon color="error" />;
      return <FactCheckIcon color="success" />;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { position: 'fixed', top: 50, borderRadius: 3 } }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eee' }}>
            <SearchIcon color="action" />
            <InputBase 
                placeholder="Search everything (ID, Title, Keyword)..." 
                fullWidth 
                autoFocus 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ fontSize: '1.1rem' }}
            />
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
        
        <DialogContent sx={{ p: 0, minHeight: 100, maxHeight: 400 }}>
            {query.length > 0 && results.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    No results found for "{query}"
                </Box>
            )}
            
            <List disablePadding>
                {results.map((res) => (
                    // ✅ FIX: Use ListItem + ListItemButton structure for MUI v5
                    <ListItem key={res.id} disablePadding divider>
                        <ListItemButton onClick={() => handleSelect(res.path)}>
                            <Box sx={{ mr: 2, mt: 0.5, display: 'flex' }}>{getIcon(res.type)}</Box>
                            <ListItemText 
                                primary={<Typography fontWeight={600}>{res.title}</Typography>}
                                secondary={`${res.type} • ${res.id}`}
                            />
                            <Chip label="Open" size="small" variant="outlined" clickable />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {query.length === 0 && (
                 <Box sx={{ p: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">QUICK LINKS</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label="Recent SOPs" onClick={() => handleSelect('/dms')} />
                        <Chip label="My Open Tasks" onClick={() => handleSelect('/tasks')} />
                        <Chip label="Log Deviation" onClick={() => handleSelect('/deviations')} />
                    </Box>
                 </Box>
            )}
        </DialogContent>
    </Dialog>
  );
}