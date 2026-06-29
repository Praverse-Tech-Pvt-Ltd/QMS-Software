import { Box, Button, Typography, Chip, CircularProgress, Alert, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { oosService, type OOSRecord, type OOSStats } from "../../services/oos.service";

const COLUMNS: ColumnDef<OOSRecord>[] = [
  { field: "oos_number", headerName: "OOS #", width: 130 },
  { field: "sample_id", headerName: "Sample ID", width: 130 },
  { field: "test_name", headerName: "Test", width: 200 },
  { field: "result_obtained", headerName: "Result", width: 120 },
  { field: "specification", headerName: "Spec", width: 120 },
  {
    field: "phase",
    headerName: "Phase",
    width: 110,
    renderCell: (row) => row.phase ? (
      <Chip label={row.phase.replace("phase", "Phase ")} size="small"
        sx={{ bgcolor: "#EEF2FF", color: "#667eea", fontWeight: 600 }} />
    ) : null,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

export default function OOSListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OOSRecord[]>([]);
  const [stats, setStats] = useState<OOSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([oosService.list(), oosService.getStats()])
      .then(([data, s]) => { setRows(data); setStats(s); })
      .catch(() => setError("Failed to load OOS records."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>OOS Investigations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/oos/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New OOS
        </Button>
      </Box>
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Total", value: stats.total, color: "#667eea" },
            { label: "Open", value: stats.open, color: "#F59E0B" },
            { label: "Phase 1 Pending", value: stats.phase1_pending, color: "#3B82F6" },
            { label: "Phase 2 Pending", value: stats.phase2_pending, color: "#EF4444" },
          ].map((s) => (
            <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
              <Box sx={{ p: 2, borderRadius: 2, border: `2px solid ${s.color}20`, bgcolor: `${s.color}08`, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/oos/${id}`)} />
      )}
    </Box>
  );
}
