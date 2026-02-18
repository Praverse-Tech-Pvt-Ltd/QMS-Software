import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Typography, Stack 
} from "@mui/material";
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useState } from "react";
import type { CapaAction } from "../../services/capa.service";

interface AddCapaActionModalProps {
  open: boolean;
  onClose: () => void;
  // ✅ Explicitly typing the callback to match CapaAction structure
  onAdd: (action: Omit<CapaAction, "id">) => void;
}

export default function AddCapaActionModal({ open, onClose, onAdd }: AddCapaActionModalProps) {
  const [form, setForm] = useState<Omit<CapaAction, "id">>({
    description: "",
    owner: "",
    due_date: "",
    status: "PENDING"
  });

  const handleSubmit = () => {
    if (!form.description || !form.due_date) return;
    onAdd(form);
    // Reset form for next use
    setForm({ description: "", owner: "", due_date: "", status: "PENDING" });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.main', 
          p: 0.5, 
          borderRadius: 1, 
          display: 'flex' 
        }}>
          <PlaylistAddCheckIcon />
        </Box>
        <Typography variant="h6" fontWeight={800}>Define Corrective Action</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Specify a clear task, assign a responsible owner, and set a target date for completion.
        </Typography>

        <Stack spacing={2.5}>
          <TextField 
            label="Action Description" 
            fullWidth 
            multiline 
            rows={3}
            placeholder="e.g., Update SOP-QA-05 to reflect new gowning requirements..."
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fcfcfc" } }}
          />

          <TextField 
            label="Responsible Owner" 
            fullWidth 
            placeholder="e.g., Production Manager / QA Lead"
            value={form.owner}
            onChange={(e) => setForm({...form, owner: e.target.value})}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Target Due Date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              value={form.due_date}
              onChange={(e) => setForm({...form, due_date: e.target.value})}
            />
            <TextField 
              select 
              label="Initial Status" 
              fullWidth 
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value as any})}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done (Completed)</MenuItem>
            </TextField>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!form.description || !form.due_date}
          sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
        >
          Add Action Item
        </Button>
      </DialogActions>
    </Dialog>
  );
}