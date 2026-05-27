import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  alpha
} from "@mui/material";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { useEffect, useState } from "react";
import { trainingService, type TrainingPlan } from "../../services/training.service";
import { useSnackbar } from "notistack";
import api from "../../services/api";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

interface AssignTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  planId?: number;
  planTitle?: string;
  onSuccess?: () => void; 
}

export default function AssignTrainingDialog({ 
  open, 
  onClose, 
  planId, 
  planTitle, 
  onSuccess 
}: AssignTrainingDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | string | "">(""); // ✅ Allowed string for safety
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (open) {
      loadInitialData();
      // If planId is passed from the Detail Page (e.g. 10), set it
      if (planId) setSelectedPlanId(planId);
    }
  }, [open, planId]);

  const loadInitialData = async () => {
    try {
      setFetchingData(true);
      const [plansData, usersResponse] = await Promise.all([
        trainingService.list(),
        api.get<User[]>("/auth/employees/") 
      ]);
      setPlans(plansData);
      setUsers(usersResponse.data);
    } catch (err) {
      enqueueSnackbar("Failed to synchronize personnel records", { variant: "error" });
    } finally {
      setFetchingData(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlanId || !selectedUserId || !dueDate) return;

    // ✅ GxP Validation: No past dates for new assignments
    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      enqueueSnackbar("Compliance deadline cannot be in the past", { variant: "warning" });
      return;
    }
  
    try {
      setLoading(true);
      
      // ✅ SUPER CLEANING: Handle PLAN-10, TRN-10, or just 10
      // Extract only digits to send to the backend
      const cleanPlanId = typeof selectedPlanId === 'string' 
        ? Number(selectedPlanId.replace(/\D/g, '')) 
        : selectedPlanId;

      await trainingService.assignUserToPlan(cleanPlanId, Number(selectedUserId), dueDate);
      
      enqueueSnackbar(`Training assignment created successfully!`, { variant: "success" });
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Assignment failed. User may already be assigned.";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setSelectedPlanId("");
    setSelectedUserId("");
    setDueDate("");
    onClose();
  };

  const currentPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 3 }}>
        <Box sx={{ bgcolor: alpha("#4F46E5", 0.1), color: "#4F46E5", p: 1, borderRadius: 2, display: 'flex' }}>
            <PersonAddAlt1Icon />
        </Box>
        <Box>
            <Typography variant="h6" fontWeight={900}>Personnel Assignment</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>TRAINING & QUALIFICATION</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        {fetchingData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={32} thickness={5} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Syncing latest training master data...</Typography>
          </Box>
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info" variant="standard" sx={{ borderRadius: 3, fontWeight: 500 }}>
              Assigning training for: <strong>{currentPlan?.title || planTitle || "N/A"}</strong>
            </Alert>

            <TextField
              select
              label="Select Training Plan"
              fullWidth
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              disabled={!!planId}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } }}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={800}>TRN-{plan.id.toString().padStart(3, '0')}</Typography>
                    <Typography variant="caption" color="text.secondary">{plan.title}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Personnel (Trainee)"
              fullWidth
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Typography variant="body2" fontWeight={600}>
                    {user.first_name} {user.last_name} 
                    <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        — {user.role}
                    </Typography>
                  </Typography>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Compliance Deadline"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              helperText="Trainee must certify completion before this date to remain compliant."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: '#f8fafc' } }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading} sx={{ fontWeight: 800, textTransform: 'none' }}>
          Discard
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAssign} 
          disabled={loading || !selectedPlanId || !selectedUserId || !dueDate}
          sx={{ 
            bgcolor: "#4F46E5", 
            fontWeight: 800, 
            px: 4,
            borderRadius: 2.5,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}
        >
          {loading ? "Assigning..." : "Confirm Assignment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}