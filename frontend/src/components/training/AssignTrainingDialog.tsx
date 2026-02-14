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
  Alert
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
  initialPlanId?: number;
}

export default function AssignTrainingDialog({ open, onClose, planId, planTitle }: AssignTrainingDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>("");
  const [selectedUserId, setSelectedUserId] = useState("");
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
        api.get("/auth/employees/") 
      ]);
      setPlans(plansData);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error("Fetch error:", err);
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
      resetForm();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || "Assignment failed", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPlanId("");
    setSelectedUserId("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid #e2e8f0" }}>
        Assign New Training Task
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {fetchingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={40} /></Box>
        ) : (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert severity="info">
              Assigning: <strong>{planTitle || "New Module"}</strong>
            </Alert>
            <TextField
              select
              label="Select Training Module"
              fullWidth
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>{plan.title}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Select Employee"
              fullWidth
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>{user.first_name} {user.last_name}</MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Completion Deadline"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleAssign} disabled={loading || !selectedPlanId || !selectedUserId || !dueDate} sx={{ bgcolor: "#4F46E5" }}>
          Confirm Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
}