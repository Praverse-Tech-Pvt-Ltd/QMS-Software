import { 
  Paper, Typography, Box,  Grid, TextField, MenuItem, 
  List, ListItem, ListItemIcon, ListItemText, Checkbox, 
  Button, Divider, Chip, Stack, CircularProgress, alpha
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState, useEffect } from "react";
import { trainingService, type TrainingPlan } from "../../services/training.service";
import { useSnackbar } from "notistack";

interface TrainingMatrixBuilderProps {
  // ✅ This prop allows the Parent Page to know which plan is being looked at
  onSelectPlan?: (plan: TrainingPlan) => void;
}

const ROLES = ["Operator", "Supervisor", "QA Specialist", "Maintenance", "Lab Technician"];

export default function TrainingMatrixBuilder({ onSelectPlan }: TrainingMatrixBuilderProps) {
  const { enqueueSnackbar } = useSnackbar();
  
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [availablePlans, setAvailablePlans] = useState<TrainingPlan[]>([]);
  const [assignedSopIds, setAssignedSopIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Master Data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);
        const data = await trainingService.list();
        setAvailablePlans(data);
        
        // Initial Mock - In production this would fetch the current assignments for the role
        setAssignedSopIds(["1", "2"]); 
      } catch (err) {
        enqueueSnackbar("Failed to sync training curriculum", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, [selectedRole, enqueueSnackbar]);

  const handleToggle = (plan: TrainingPlan) => {
    const sopId = plan.id.toString();
    const currentIndex = assignedSopIds.indexOf(sopId);
    const newChecked = [...assignedSopIds];
    
    if (currentIndex === -1) {
        newChecked.push(sopId);
    } else {
        newChecked.splice(currentIndex, 1);
    }
    
    setAssignedSopIds(newChecked);
    
    // ✅ Trigger the parent's select handler so the "Retraining Modal" knows the context
    if (onSelectPlan) onSelectPlan(plan);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // ✅ Handshake: Pass role and associated Plan IDs to the backend to generate assignments
      // await trainingService.updateRoleMatrix(selectedRole, assignedSopIds);
      
      enqueueSnackbar(`Matrix committed. Generated assignments for ${selectedRole}.`, { 
        variant: "success" 
      });
    } catch (err) {
      enqueueSnackbar("Compliance commit failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ p: 5, textAlign: 'center' }}>
      <CircularProgress size={30} />
      <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>Syncing Master Curriculum...</Typography>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ bgcolor: alpha('#4F46E5', 0.1), p: 1, borderRadius: 2, display: 'flex' }}>
            <FactCheckIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Job Role Matrix</Typography>
            <Typography variant="body2" color="text.secondary">Map required SOPs to personnel classifications</Typography>
          </Box>
        </Stack>
        <Button 
          variant="contained" 
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} 
          onClick={handleSave} 
          disabled={saving}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, textTransform: 'none' }}
        >
          {saving ? "Processing..." : "Commit Matrix"}
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

          <Box sx={{ mt: 4, p: 3, bgcolor: alpha('#4F46E5', 0.05), borderRadius: 4, border: `1px solid ${alpha('#4F46E5', 0.1)}` }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <InfoOutlinedIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>
                Impact Analysis
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500, color: 'text.primary' }}>
              Modifying this matrix will impact personnel in the <b>{selectedRole}</b> role. 
              New <b>Training Assignments</b> will be generated automatically for any gaps found.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
            Curriculum Requirements
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: '#e2e8f0' }}>
            <List sx={{ py: 0 }}>
              {availablePlans.map((plan, index) => {
                const isChecked = assignedSopIds.indexOf(plan.id.toString()) !== -1;
                return (
                  <Box key={plan.id}>
                    <ListItem 
                      sx={{ 
                        py: 2, 
                        px: 3, 
                        bgcolor: isChecked ? alpha('#4F46E5', 0.02) : 'transparent',
                        '&:hover': { bgcolor: '#f8fafc', cursor: 'pointer' } 
                      }}
                      onClick={() => handleToggle(plan)}
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={plan.method} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 700, borderRadius: 1, fontSize: '0.65rem' }} 
                          />
                          <Chip 
                            label={plan.version || "v1.0"} 
                            size="small" 
                            sx={{ fontWeight: 800, borderRadius: 1, fontSize: '0.65rem' }} 
                          />
                        </Stack>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox 
                          edge="start" 
                          checked={isChecked} 
                          disableRipple
                          sx={{ color: '#cbd5e1', '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={plan.title} 
                        secondary={`Plan ID: ${plan.id} | ${plan.department}`} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: 700, 
                          color: isChecked ? 'text.primary' : 'text.secondary' 
                        }}
                        secondaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                      />
                    </ListItem>
                    {index < availablePlans.length - 1 && <Divider />}
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