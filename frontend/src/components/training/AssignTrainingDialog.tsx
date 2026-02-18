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
  Typography
} from "@mui/material";
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
  onSuccess?: () => void; // ✅ Callback to refresh parent data
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
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (open) {
      loadInitialData();
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
      enqueueSnackbar("Failed to load assignment data", { variant: "error" });
    } finally {
      setFetchingData(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlanId || !selectedUserId || !dueDate) return;
    try {
      setLoading(true);
      await trainingService.assignUserToPlan(Number(selectedPlanId), Number(selectedUserId), dueDate);
      
      enqueueSnackbar(`Training assigned successfully!`, { variant: "success" });
      if (onSuccess) onSuccess(); // ✅ Trigger reload in Detail Page
      handleClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Assignment failed";
      enqueueSnackbar(errorMsg, { variant: "error" });
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

  // Find currently selected plan for the alert text
  const currentPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 900, fontSize: "1.25rem", pt: 3 }}>
        Create Personnel Assignment
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {fetchingData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={32} thickness={5} />
            <Typography variant="body2" color="text.secondary">Fetching latest plan & user lists...</Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              Target Plan: <strong>{currentPlan?.title || planTitle || "Selection Required"}</strong>
            </Alert>

            <TextField
              select
              label="Training Module / SOP"
              fullWidth
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              disabled={!!planId} // ✅ Lock field if planId passed from Detail Page
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>TRN-{plan.id}</Typography>
                    <Typography variant="caption" color="text.secondary">{plan.title}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Assignee"
              fullWidth
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.role})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Training Deadline"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              helperText="Trainee must complete qualification before this date."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAssign} 
          disabled={loading || !selectedPlanId || !selectedUserId || !dueDate}
          sx={{ 
            bgcolor: "#4F46E5", 
            fontWeight: 700, 
            px: 4,
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          {loading ? "Processing..." : "Confirm Assignment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}