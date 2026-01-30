import { 
  Paper, 
  Typography, 
  Box, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  TextField, 
  Button, 
  Divider,
  Alert
} from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useState } from "react";

export default function OjtChecklist() {
  const [tasks, setTasks] = useState({
    task1: false,
    task2: false,
    task3: false,
    task4: false,
  });
  const [supervisorName, setSupervisorName] = useState("");
  const [signed, setSigned] = useState(false);

  const allChecked = Object.values(tasks).every(Boolean);

  const handleSignOff = () => {
    setSigned(true);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fff' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <VerifiedUserIcon color={signed ? "success" : "action"} fontSize="large" />
        <Box>
            <Typography variant="h6" fontWeight={800}>
                OJT Checklist: Aseptic Gowning
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Practical Assessment
            </Typography>
        </Box>
      </Box>

      {!signed ? (
        <>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Supervisor must verify the trainee can perform the following tasks independently:
            </Typography>
            
            <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel control={<Checkbox checked={tasks.task1} onChange={(e)=>setTasks({...tasks, task1: e.target.checked})} />} label="Proper hand washing technique (20s)" />
                <FormControlLabel control={<Checkbox checked={tasks.task2} onChange={(e)=>setTasks({...tasks, task2: e.target.checked})} />} label="Donning of sterile gown without touching exterior" />
                <FormControlLabel control={<Checkbox checked={tasks.task3} onChange={(e)=>setTasks({...tasks, task3: e.target.checked})} />} label="Correct application of sterile gloves" />
                <FormControlLabel control={<Checkbox checked={tasks.task4} onChange={(e)=>setTasks({...tasks, task4: e.target.checked})} />} label="Goggles and mask fit check" />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Supervisor Verification</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                    label="Supervisor Username" 
                    size="small" 
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    fullWidth
                />
                <Button 
                    variant="contained" 
                    disabled={!allChecked || !supervisorName}
                    onClick={handleSignOff}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Sign Off
                </Button>
            </Box>
        </>
      ) : (
          <Alert severity="success" icon={<VerifiedUserIcon />}>
              <b>Certified by {supervisorName}</b> on {new Date().toLocaleDateString()}. 
              <br/>Trainee is cleared for independent work.
          </Alert>
      )}
    </Paper>
  );
}