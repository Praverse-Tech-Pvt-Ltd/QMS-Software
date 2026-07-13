import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { recallService, type RecallRecord } from "../../services/recall.service";

const RECALL_CLASSES = [
  { value: "I", label: "Class I — health hazard" },
  { value: "II", label: "Class II — may cause adverse health consequences" },
  { value: "III", label: "Class III — not likely to cause adverse health consequences" },
];

const CLASS_COLORS: Record<string, { bg: string; color: string }> = {
  I: { bg: "#FEE2E2", color: "#991B1B" },
  II: { bg: "#FEF3C7", color: "#92400E" },
  III: { bg: "#F3F4F6", color: "#374151" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  initiated: { bg: "#F3F4F6", color: "#374151" },
  active: { bg: "#FEE2E2", color: "#991B1B" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  closed: { bg: "#EEF2FF", color: "#667eea" },
};

const COLUMNS: ColumnDef<RecallRecord>[] = [
  { field: "recall_number", headerName: "Recall #", width: 130 },
  { field: "product", headerName: "Product", width: 220 },
  {
    field: "recall_class",
    headerName: "Class",
    width: 100,
    renderCell: (row) => {
      const c = CLASS_COLORS[row.recall_class] || CLASS_COLORS.III;
      return <Chip label={`Class ${row.recall_class}`} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700 }} />;
    },
  },
  { field: "initiated_date", headerName: "Initiated", width: 130 },
  {
    field: "regulatory_notified",
    headerName: "Regulator Notified",
    width: 150,
    renderCell: (row) => (
      <Chip label={row.regulatory_notified ? "Yes" : "No"} size="small"
        sx={row.regulatory_notified ? { bgcolor: "#D1FAE5", color: "#065F46" } : { bgcolor: "#F3F4F6", color: "#6B7280" }} />
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => {
      const c = STATUS_COLORS[row.status] || STATUS_COLORS.initiated;
      return <Chip label={row.status_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    },
  },
];

const EMPTY_FORM: { product: string; batch_lots: string; recall_class: RecallRecord["recall_class"]; reason: string } = {
  product: "", batch_lots: "", recall_class: "III", reason: "",
};

export default function RecallListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RecallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    recallService.list()
      .then(setRows)
      .catch(() => setError("Failed to load recall records."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.product.trim() || !form.reason.trim()) return;
    setSaving(true);
    try {
      const created = await recallService.create({
        product: form.product,
        recall_class: form.recall_class,
        reason: form.reason,
        batch_lots: form.batch_lots.split(",").map((b) => b.trim()).filter(Boolean),
      });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      navigate(`/recall/${created.id}`);
    } catch {
      setError("Failed to create recall record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Recall Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Recall
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/recall/${id}`)} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Recall</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Product" fullWidth required value={form.product} autoFocus
            onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <TextField label="Batch / Lot Numbers (comma-separated)" fullWidth value={form.batch_lots}
            onChange={(e) => setForm({ ...form, batch_lots: e.target.value })} placeholder="B2026001, B2026002" />
          <TextField select label="Recall Class" fullWidth value={form.recall_class}
            onChange={(e) => setForm({ ...form, recall_class: e.target.value as RecallRecord["recall_class"] })}>
            {RECALL_CLASSES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
          <TextField label="Reason" fullWidth required multiline minRows={2} value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.product.trim() || !form.reason.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
