import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Typography, Stack, alpha 
} from "@mui/material";
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useState } from "react";
import type { CapaAction } from "../../services/capa.service";

interface AddCapaActionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (action: Omit<CapaAction, "id">) => void;
}

export default function AddCapaActionModal({ open, onClose, onAdd }: AddCapaActionModalProps) {
  const initialState: Omit<CapaAction, "id"> = {
    description: "",
    owner: "",
    due_date: "",
    status: "PENDING"
  };

  const [form, setForm] = useState<Omit<CapaAction, "id">>(initialState);

  const handleSubmit = () => {
    // Basic validation to ensure audit readiness
    if (!form.description || !form.due_date || !form.owner) return;
    
    onAdd(form);
    handleClose();
  };

  const handleClose = () => {
    setForm(initialState);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, pt: 3 }}>
        <Box sx={{ 
          bgcolor: alpha("#4f46e5", 0.1), 
          color: 'primary.main', 
          p: 1, 
          borderRadius: 2, 
          display: 'flex' 
        }}>
          <PlaylistAddCheckIcon />
        </Box>
        <Box>
            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>
                New Corrective Action
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TASK ASSIGNMENT & SCHEDULING
            </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, mt: 1, lineHeight: 1.6 }}>
          Define the specific task required to address the root cause. Assign a lead owner who will be responsible for providing evidence of completion.
        </Typography>

        <Stack spacing={3}>
          <TextField 
            label="Action Description" 
            fullWidth 
            multiline 
            rows={3}
            required
            placeholder="Describe the specific steps to be taken..."
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
          />

          <TextField 
            label="Responsible Assignee" 
            fullWidth 
            required
            placeholder="Name or Department (e.g. John Doe / QA)"
            value={form.owner}
            onChange={(e) => setForm({...form, owner: e.target.value})}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Target Date" 
              type="date" 
              required
              fullWidth 
              InputLabelProps={{ shrink: true }}
              value={form.due_date}
              onChange={(e) => setForm({...form, due_date: e.target.value})}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
            />
            <TextField 
              select 
              label="Initial Phase" 
              fullWidth 
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value as any})}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
            >
              <MenuItem value="PENDING" sx={{ fontWeight: 600 }}>Pending</MenuItem>
              <MenuItem value="IN_PROGRESS" sx={{ fontWeight: 600 }}>In Progress</MenuItem>
              <MenuItem value="DONE" sx={{ fontWeight: 600 }}>Completed</MenuItem>
            </TextField>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 800, textTransform: 'none' }}>
          Discard
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!form.description || !form.due_date || !form.owner}
          sx={{ 
            borderRadius: 2.5, 
            px: 4, 
            fontWeight: 800, 
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}
        >
          Add to Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}