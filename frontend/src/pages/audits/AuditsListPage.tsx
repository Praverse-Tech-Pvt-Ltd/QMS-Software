import { Box, Button, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { auditsService, type AuditRecord } from "../../services/audits.service";

const COLUMNS: ColumnDef<AuditRecord>[] = [
  { field: "audit_number", headerName: "Audit #", width: 140 },
  { field: "title", headerName: "Title", width: 300 },
  { field: "audit_type", headerName: "Type", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => (
      <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />
    ),
  },
  { field: "planned_start", headerName: "Planned Start", width: 140 },
  { field: "lead_auditor", headerName: "Lead Auditor", width: 160 },
];

export default function AuditsListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auditsService.list()
      .then(setRows)
      .catch(() => setError("Failed to load audits."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Audits</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/audits/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Audit
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/audits/${id}`)} />
      )}
    </Box>
  );
}
