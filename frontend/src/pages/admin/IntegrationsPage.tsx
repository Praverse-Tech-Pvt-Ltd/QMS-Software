import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, FormControlLabel, Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import {
  integrationsService,
  type IntegrationConfig,
  type IntegrationSyncLog,
  type ERPSystemType,
} from "../../services/integrations.service";
import { useRole } from "../../app/providers/RoleProvider";

const SYSTEM_TYPES: { value: ERPSystemType; label: string }[] = [
  { value: "sap", label: "SAP ERP" },
  { value: "oracle", label: "Oracle ERP" },
  { value: "generic_rest", label: "Generic REST API" },
];

const CONFIG_COLUMNS: ColumnDef<IntegrationConfig>[] = [
  { field: "name", headerName: "Name", width: 220 },
  { field: "system_type_display", headerName: "System Type", width: 160 },
  { field: "base_url", headerName: "Base URL", width: 260 },
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

const SYNC_LOG_COLUMNS: ColumnDef<IntegrationSyncLog>[] = [
  { field: "entity_type", headerName: "Entity", width: 180 },
  { field: "direction_display", headerName: "Direction", width: 120 },
  {
    field: "status_display",
    headerName: "Status",
    width: 120,
    renderCell: (row) => (
      <Chip
        label={row.status_display}
        size="small"
        sx={
          row.status === "success"
            ? { bgcolor: "#D1FAE5", color: "#065F46" }
            : row.status === "failed"
            ? { bgcolor: "#FEE2E2", color: "#991B1B" }
            : { bgcolor: "#FEF3C7", color: "#92400E" }
        }
      />
    ),
  },
  { field: "records_synced", headerName: "Records", width: 100, align: "right" },
  { field: "started_at", headerName: "Started", width: 200 },
  { field: "error_message", headerName: "Error", width: 260 },
];

const EMPTY_FORM: Partial<IntegrationConfig> = {
  system_type: "generic_rest",
  name: "",
  base_url: "",
  is_active: false,
  config: {},
};

export default function IntegrationsPage() {
  const { role } = useRole();
  const isAdmin = role === "Admin";

  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [syncLog, setSyncLog] = useState<IntegrationSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<IntegrationConfig>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadConfigs = () => {
    setLoading(true);
    integrationsService.listConfigs()
      .then(setConfigs)
      .catch(() => setError("Failed to load integration configs."))
      .finally(() => setLoading(false));
  };

  const loadSyncLog = () => {
    setLogLoading(true);
    integrationsService.listSyncLog()
      .then(setSyncLog)
      .catch(() => setError("Failed to load integration sync log."))
      .finally(() => setLogLoading(false));
  };

  useEffect(() => {
    loadConfigs();
    loadSyncLog();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (config: IntegrationConfig) => {
    setEditingId(config.id);
    setForm({
      system_type: config.system_type,
      name: config.name,
      base_url: config.base_url,
      is_active: config.is_active,
      config: config.config,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (editingId != null) {
        await integrationsService.updateConfig(editingId, form);
      } else {
        await integrationsService.createConfig(form);
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadConfigs();
    } catch {
      setError("Failed to save integration config.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>ERP Integration Hooks</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            New Integration
          </Button>
        )}
      </Box>
      {!isAdmin && <Alert severity="info" sx={{ mb: 2 }}>Only Admin can create or edit ERP integration configs.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Configurations</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <ModuleTable
          columns={CONFIG_COLUMNS}
          rows={configs}
          onView={isAdmin ? (id) => {
            const found = configs.find((c) => String(c.id) === String(id));
            if (found) openEditDialog(found);
          } : undefined}
        />
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4, mb: 1.5 }}>Sync Log</Typography>
      {logLoading ? <CircularProgress /> : <ModuleTable columns={SYNC_LOG_COLUMNS} rows={syncLog} />}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editingId != null ? "Edit Integration" : "New Integration"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select
            label="System Type"
            fullWidth
            required
            value={form.system_type ?? "generic_rest"}
            onChange={(e) => setForm({ ...form, system_type: e.target.value as ERPSystemType })}
          >
            {SYSTEM_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Name" fullWidth required value={form.name ?? ""} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Base URL" fullWidth value={form.base_url ?? ""}
            placeholder="https://erp.example.com/api"
            onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
          <FormControlLabel
            control={
              <Switch
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
          <Alert severity="warning" sx={{ mt: -1 }}>
            Never enter credentials, API keys, or tokens here. Configure those via environment
            variables on the server and reference them by name only.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name?.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {editingId != null ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
