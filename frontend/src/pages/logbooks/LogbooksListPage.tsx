import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { logbooksService, type Logbook } from "../../services/logbooks.service";

const LOGBOOK_TYPES = [
  { value: "equipment", label: "Equipment Logbook" },
  { value: "area", label: "Area / Room Logbook" },
  { value: "instrument", label: "Instrument Logbook" },
];

const COLUMNS: ColumnDef<Logbook>[] = [
  { field: "name", headerName: "Name", width: 260 },
  { field: "logbook_type_display", headerName: "Type", width: 160 },
  { field: "department", headerName: "Department", width: 150 },
  { field: "location", headerName: "Location", width: 180 },
  {
    field: "entry_count",
    headerName: "Entries",
    width: 100,
    renderCell: (row) => <Chip label={row.entry_count} size="small" />,
  },
  {
    field: "last_entry_date",
    headerName: "Last Entry",
    width: 140,
    renderCell: (row) => (row.last_entry_date ? new Date(row.last_entry_date).toLocaleDateString() : "—"),
  },
];

const EMPTY_FORM: { name: string; logbook_type: Logbook["logbook_type"]; equipment_id: string; location: string; department: string } = {
  name: "", logbook_type: "equipment", equipment_id: "", location: "", department: "",
};

export default function LogbooksListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    logbooksService.list()
      .then(setRows)
      .catch(() => setError("Failed to load logbooks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await logbooksService.create(form);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      navigate(`/logbooks/${created.id}`);
    } catch {
      setError("Failed to create logbook.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Electronic Logbooks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Logbook
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/logbooks/${id}`)} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Logbook</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Name" fullWidth required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          <TextField select label="Type" fullWidth value={form.logbook_type}
            onChange={(e) => setForm({ ...form, logbook_type: e.target.value as Logbook["logbook_type"] })}>
            {LOGBOOK_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField label="Equipment / Instrument ID" fullWidth value={form.equipment_id}
            onChange={(e) => setForm({ ...form, equipment_id: e.target.value })} />
          <TextField label="Location" fullWidth value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <TextField label="Department" fullWidth value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
