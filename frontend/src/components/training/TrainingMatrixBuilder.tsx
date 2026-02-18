import { 
  Paper, Typography, Box,  Grid, TextField, MenuItem, 
  List, ListItem, ListItemIcon, ListItemText, Checkbox, 
  Button, Divider, Chip, Stack
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";

const ROLES = ["Operator", "Supervisor", "QA Specialist", "Maintenance"];
const SOPS = [
  { id: "SOP-001", title: "Gowning Procedure", version: "v2.0" },
  { id: "SOP-002", title: "Line Clearance", version: "v1.5" },
  { id: "SOP-003", title: "Deviation Reporting", version: "v3.0" },
  { id: "SOP-004", title: "Document Control Basics", version: "v1.0" },
  { id: "SOP-005", title: "Equipment Cleaning", version: "v2.2" },
];

export default function TrainingMatrixBuilder() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [assignedSops, setAssignedSops] = useState<string[]>(["SOP-001", "SOP-005"]);

  const handleToggle = (sopId: string) => {
    const currentIndex = assignedSops.indexOf(sopId);
    const newChecked = [...assignedSops];
    if (currentIndex === -1) newChecked.push(sopId);
    else newChecked.splice(currentIndex, 1);
    setAssignedSops(newChecked);
  };

  const handleSave = () => {
    alert(`Saved ${assignedSops.length} assignments for role: ${selectedRole}`);
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 2, display: 'flex' }}>
            <FactCheckIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Job Role Matrix</Typography>
            <Typography variant="body2" color="text.secondary">Define required SOPs for specific personnel classifications</Typography>
          </Box>
        </Stack>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 700 }}>
          Commit Matrix
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
            Classification Target
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } }}
          >
            {ROLES.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </TextField>

          <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f7ff', borderRadius: 4, border: '1px solid #dbeafe' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <InfoOutlinedIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>
                Impact Analysis
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
              Modifying this matrix will generate <b>{assignedSops.length * 5}</b> training tasks across current staff in this role. 
              Staff will be marked as <b>"Out of Compliance"</b> until new tasks are completed.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
            Curriculum Requirements
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: '#e2e8f0' }}>
            <List sx={{ py: 0 }}>
              {SOPS.map((sop, index) => {
                const isChecked = assignedSops.indexOf(sop.id) !== -1;
                return (
                  <Box key={sop.id}>
                    <ListItem 
                      sx={{ 
                        py: 2, 
                        px: 3, 
                        bgcolor: isChecked ? '#fdfdfd' : 'transparent',
                        '&:hover': { bgcolor: '#f8fafc' } 
                      }}
                      secondaryAction={<Chip label={sop.version} size="small" sx={{ fontWeight: 700, borderRadius: 1 }} />}
                    >
                      <ListItemIcon>
                        <Checkbox 
                          edge="start" 
                          checked={isChecked} 
                          onChange={() => handleToggle(sop.id)}
                          sx={{ color: '#cbd5e1' }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={sop.title} 
                        secondary={sop.id} 
                        primaryTypographyProps={{ fontWeight: 700, color: isChecked ? 'text.primary' : 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                      />
                    </ListItem>
                    {index < SOPS.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}