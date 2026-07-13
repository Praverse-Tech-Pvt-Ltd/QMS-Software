import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { sitesService, type Site } from "../../services/sites.service";
import { useRole } from "../../app/providers/RoleProvider";

const COLUMNS: ColumnDef<Site>[] = [
  { field: "code", headerName: "Code", width: 100 },
  { field: "name", headerName: "Name", width: 260 },
  { field: "country", headerName: "Country", width: 160 },
  {
    field: "is_active",
    headerName: "Status",
    width: 120,
    renderCell: (row) => (
      <Chip label={row.is_active ? "Active" : "Inactive"} size="small"
        sx={row.is_active ? { bgcolor: "#D1FAE5", color: "#065F46" } : { bgcolor: "#F3F4F6", color: "#6B7280" }} />
    ),
  },
];

const EMPTY_FORM = { name: "", code: "", country: "India" };

export default function SiteManagementPage() {
  const { role } = useRole();
  const isAdmin = role === "Admin";
  const [rows, setRows] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    sitesService.list()
      .then(setRows)
      .catch(() => setError("Failed to load sites."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    try {
      await sitesService.create(form);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      setError("Failed to create site. Code may already be in use.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Site Management</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            New Site
          </Button>
        )}
      </Box>
      {!isAdmin && <Alert severity="info" sx={{ mb: 2 }}>Only Admin can create or edit sites.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : <ModuleTable columns={COLUMNS} rows={rows} />}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Site</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Name" fullWidth required value={form.name} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Code" fullWidth required value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <TextField label="Country" fullWidth value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name.trim() || !form.code.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
