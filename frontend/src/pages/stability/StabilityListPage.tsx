import {
  Box, Button, Typography, Chip, CircularProgress, Alert, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { stabilityService, type StabilityProtocol } from "../../services/stability.service";

const STUDY_TYPES = [
  { value: "long_term", label: "Long Term" },
  { value: "accelerated", label: "Accelerated" },
  { value: "intermediate", label: "Intermediate" },
  { value: "stress", label: "Stress" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#F3F4F6", color: "#374151" },
  approved: { bg: "#D1FAE5", color: "#065F46" },
  closed: { bg: "#EEF2FF", color: "#667eea" },
};

const COLUMNS: ColumnDef<StabilityProtocol>[] = [
  { field: "protocol_number", headerName: "Protocol #", width: 140 },
  { field: "product", headerName: "Product", width: 200 },
  { field: "batch_lot", headerName: "Batch / Lot", width: 130 },
  { field: "study_type_display", headerName: "Study Type", width: 130 },
  { field: "storage_condition", headerName: "Storage", width: 140 },
  {
    field: "progress",
    headerName: "Pull Points",
    width: 160,
    renderCell: (row) => {
      const { total, completed } = row.progress;
      const pct = total > 0 ? (completed / total) * 100 : 0;
      return (
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption">{completed}/{total} completed</Typography>
          <LinearProgress variant="determinate" value={pct} sx={{ borderRadius: 1, height: 6, mt: 0.5 }} />
        </Box>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => {
      const c = STATUS_COLORS[row.status] || STATUS_COLORS.draft;
      return <Chip label={row.status_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    },
  },
];

const EMPTY_FORM: {
  product: string; batch_lot: string; study_type: StabilityProtocol["study_type"];
  storage_condition: string; study_start_date: string; planned_end_date: string;
} = {
  product: "", batch_lot: "", study_type: "long_term",
  storage_condition: "", study_start_date: new Date().toISOString().slice(0, 10), planned_end_date: "",
};

export default function StabilityListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<StabilityProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    stabilityService.list()
      .then(setRows)
      .catch(() => setError("Failed to load stability protocols."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.product.trim() || !form.batch_lot.trim() || !form.planned_end_date) return;
    setSaving(true);
    try {
      const created = await stabilityService.create(form);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      navigate(`/stability/${created.id}`);
    } catch {
      setError("Failed to create stability protocol.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Stability Studies</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Protocol
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/stability/${id}`)} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Stability Protocol</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Product" fullWidth required value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })} autoFocus />
          <TextField label="Batch / Lot" fullWidth required value={form.batch_lot}
            onChange={(e) => setForm({ ...form, batch_lot: e.target.value })} />
          <TextField select label="Study Type" fullWidth value={form.study_type}
            onChange={(e) => setForm({ ...form, study_type: e.target.value as StabilityProtocol["study_type"] })}>
            {STUDY_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField label="Storage Condition" fullWidth placeholder="e.g. 25°C/60%RH" value={form.storage_condition}
            onChange={(e) => setForm({ ...form, storage_condition: e.target.value })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Study Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={form.study_start_date} onChange={(e) => setForm({ ...form, study_start_date: e.target.value })} />
            <TextField label="Planned End Date" type="date" fullWidth required InputLabelProps={{ shrink: true }}
              value={form.planned_end_date} onChange={(e) => setForm({ ...form, planned_end_date: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={saving || !form.product.trim() || !form.batch_lot.trim() || !form.planned_end_date}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
