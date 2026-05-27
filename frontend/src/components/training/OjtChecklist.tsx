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
  Alert,
  CircularProgress
} from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useState } from "react";
import { trainingService } from "../../services/training.service";
import { useSnackbar } from "notistack";

interface OjtChecklistProps {
  assignmentId?: number;
  onSuccess?: () => void;
}

export default function OjtChecklist({ assignmentId, onSuccess }: OjtChecklistProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState({
    task1: false,
    task2: false,
    task3: false,
    task4: false,
  });
  const [supervisorPassword, setSupervisorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);

  const allChecked = Object.values(tasks).every(Boolean);

  const handleSignOff = async () => {
    if (!assignmentId) {
      // Fallback for demo/standalone mode
      setSigned(true);
      return;
    }

    try {
      setLoading(true);
      // ✅ Backend Handshake: Using recordCompletion for Supervisor Sign-off
      await trainingService.recordCompletion(assignmentId, {
        score: 100,
        signature_password: supervisorPassword,
        comments: "OJT Practical Assessment successfully verified by supervisor."
      });

      enqueueSnackbar("Practical qualification certified successfully", { variant: "success" });
      setSigned(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Supervisor authentication failed.";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fff', borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <VerifiedUserIcon color={signed ? "success" : "primary"} fontSize="large" />
        <Box>
            <Typography variant="h6" fontWeight={800}>
                OJT Checklist: Practical Competency
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TASK VERIFICATION & SUPERVISOR ATTESTATION
            </Typography>
        </Box>
      </Box>

      {!signed ? (
        <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Supervisor must witness and check each step to certify the trainee can perform the following independently:
            </Typography>
            
            <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel 
                  control={<Checkbox checked={tasks.task1} onChange={(e)=>setTasks({...tasks, task1: e.target.checked})} />} 
                  label={<Typography variant="body2" fontWeight={500}>Proper hand washing technique (20s)</Typography>} 
                />
                <FormControlLabel 
                  control={<Checkbox checked={tasks.task2} onChange={(e)=>setTasks({...tasks, task2: e.target.checked})} />} 
                  label={<Typography variant="body2" fontWeight={500}>Donning of sterile gown without touching exterior</Typography>} 
                />
                <FormControlLabel 
                  control={<Checkbox checked={tasks.task3} onChange={(e)=>setTasks({...tasks, task3: e.target.checked})} />} 
                  label={<Typography variant="body2" fontWeight={500}>Correct application of sterile gloves</Typography>} 
                />
                <FormControlLabel 
                  control={<Checkbox checked={tasks.task4} onChange={(e)=>setTasks({...tasks, task4: e.target.checked})} />} 
                  label={<Typography variant="body2" fontWeight={500}>Goggles and mask fit check</Typography>} 
                />
            </FormGroup>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Supervisor Credentials</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                    label="Verification Password" 
                    type="password"
                    size="small" 
                    placeholder="Enter password to sign"
                    value={supervisorPassword}
                    onChange={(e) => setSupervisorPassword(e.target.value)}
                    fullWidth
                    disabled={loading}
                    sx={{ bgcolor: '#f8fafc' }}
                />
                <Button 
                    variant="contained" 
                    disabled={!allChecked || !supervisorPassword || loading}
                    onClick={handleSignOff}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ whiteSpace: 'nowrap', px: 4, fontWeight: 700, borderRadius: 2 }}
                >
                    {loading ? "Signing..." : "Certify OJT"}
                </Button>
            </Box>
        </>
      ) : (
          <Alert 
            severity="success" 
            variant="outlined"
            icon={<VerifiedUserIcon />}
            sx={{ borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
              <Typography variant="subtitle2" fontWeight={800}>Practical Assessment Complete</Typography>
              Certified via electronic signature on {new Date().toLocaleDateString()}. 
              <br/>The trainee is now qualified for independent execution of this procedure.
          </Alert>
      )}
    </Paper>
  );
}