import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem 
} from "@mui/material";
import { useState } from "react";

interface AddCapaActionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (action: any) => void;
}

export default function AddCapaActionModal({ open, onClose, onAdd }: AddCapaActionModalProps) {
  const [form, setForm] = useState({
    description: "",
    owner: "",
    due_date: "",
    status: "PENDING"
  });

  const handleSubmit = () => {
    if (!form.description || !form.due_date) return;
    onAdd(form);
    setForm({ description: "", owner: "", due_date: "", status: "PENDING" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Add New Corrective Action</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField 
            label="Action Description" 
            fullWidth 
            multiline 
            rows={2}
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
          <TextField 
            label="Owner / Department" 
            fullWidth 
            value={form.owner}
            onChange={(e) => setForm({...form, owner: e.target.value})}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Due Date" 
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
              onChange={(e) => setForm({...form, status: e.target.value})}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!form.description}>
          Add Action
        </Button>
      </DialogActions>
    </Dialog>
  );
}