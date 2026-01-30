import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Checkbox, 
  Button, 
  Divider,
  Chip
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useState } from "react";

// Mock Data
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
  const [assignedSops, setAssignedSops] = useState<string[]>(["SOP-001", "SOP-005"]); // Mock existing assignments

  const handleToggle = (sopId: string) => {
    const currentIndex = assignedSops.indexOf(sopId);
    const newChecked = [...assignedSops];

    if (currentIndex === -1) {
      newChecked.push(sopId);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setAssignedSops(newChecked);
  };

  const handleSave = () => {
    alert(`Saved ${assignedSops.length} assignments for role: ${selectedRole}`);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FactCheckIcon color="primary" fontSize="large" />
            <Box>
                <Typography variant="h6" fontWeight={800}>Training Matrix</Typography>
                <Typography variant="body2" color="text.secondary">Map Job Roles to Required SOPs</Typography>
            </Box>
         </Box>
         <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
         >
            Save Matrix
         </Button>
      </Box>

      <Grid container spacing={4}>
         {/* Role Selection */}
         <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Select Job Role</Typography>
            <TextField
                select
                fullWidth
                value={selectedRole}
                onChange={(e) => {
                    setSelectedRole(e.target.value);
                    // Mock: Randomly change checked state to simulate different roles having different needs
                    setAssignedSops(SOPS.filter((_, i) => i % 2 === 0).map(s => s.id));
                }}
            >
                {ROLES.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
            </TextField>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f9ff', borderRadius: 2 }}>
                <Typography variant="caption" color="primary" fontWeight={700}>IMPACT ANALYSIS</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Updating this matrix will trigger <b>{assignedSops.length * 5}</b> new training tasks for active employees in this role.
                </Typography>
            </Box>
         </Grid>

         {/* SOP Selection List */}
         <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Required Standard Operating Procedures (SOPs)
            </Typography>
            <Paper variant="outlined">
                <List dense>
                    {SOPS.map((sop) => {
                        const isChecked = assignedSops.indexOf(sop.id) !== -1;
                        return (
                            <div key={sop.id}>
                                <ListItem
                                    secondaryAction={
                                        <Chip label={sop.version} size="small" />
                                    }
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={isChecked}
                                            tabIndex={-1}
                                            disableRipple
                                            onChange={() => handleToggle(sop.id)}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={sop.title} 
                                        secondary={sop.id} 
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </div>
                        );
                    })}
                </List>
            </Paper>
         </Grid>
      </Grid>
    </Paper>
  );
}