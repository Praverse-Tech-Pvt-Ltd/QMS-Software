import {
  Box, Button, Typography, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import {
  retentionPolicyService,
  type RetentionPolicy,
} from "../../services/retentionPolicy.service";
import { useRole } from "../../app/providers/RoleProvider";

const COLUMNS: ColumnDef<RetentionPolicy>[] = [
  { field: "record_type", headerName: "Record Type", width: 240 },
  {
    field: "retention_years",
    headerName: "Retention Period",
    width: 160,
    renderCell: (row) => (
      <Chip
        label={`${row.retention_years} year${row.retention_years === 1 ? "" : "s"}`}
        size="small"
        sx={{ bgcolor: "#EDE9FE", color: "#5B21B6", fontWeight: 600 }}
      />
    ),
  },
  { field: "regulatory_basis", headerName: "Regulatory Basis", width: 420 },
];

export default function RetentionPoliciesPage() {
  const { role } = useRole();
  const isAdmin = role === "Admin";

  const [rows, setRows] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RetentionPolicy | null>(null);
  const [years, setYears] = useState("");
  const [basis, setBasis] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    retentionPolicyService
      .list()
      .then(setRows)
      .catch(() => setError("Failed to load retention policies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDialog = (policy: RetentionPolicy) => {
    setEditing(policy);
    setYears(String(policy.retention_years));
    setBasis(policy.regulatory_basis);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const parsedYears = Number(years);
    if (!Number.isFinite(parsedYears) || parsedYears <= 0) return;

    setSaving(true);
    try {
      await retentionPolicyService.update(editing.id, {
        retention_years: parsedYears,
        regulatory_basis: basis,
      });
      closeDialog();
      load();
    } catch {
      setError("Failed to update retention policy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Record Retention Policy</Typography>
      </Box>
      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only Admin can edit retention periods. Viewing in read-only mode.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <ModuleTable
          columns={COLUMNS}
          rows={rows}
          onView={(id) => {
            const found = rows.find((r) => String(r.id) === String(id));
            if (found) openDialog(found);
          }}
        />
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editing?.record_type}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Alert severity="warning">
            Changing retention periods requires QA approval and change control.
          </Alert>
          <TextField
            label="Retention Period (years)"
            type="number"
            fullWidth
            required
            value={years}
            disabled={!isAdmin}
            onChange={(e) => setYears(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <TextField
            label="Regulatory Basis"
            fullWidth
            multiline
            minRows={2}
            value={basis}
            disabled={!isAdmin}
            onChange={(e) => setBasis(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Close</Button>
          {isAdmin && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !years.trim() || Number(years) <= 0}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
