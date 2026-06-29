import { Box, Button, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { ncService, type NCRecord } from "../../services/nc.service";
import SeverityBadge from "../../components/common/SeverityBadge";

const COLUMNS: ColumnDef<NCRecord>[] = [
  { field: "nc_number", headerName: "NC #", width: 130 },
  { field: "title", headerName: "Title", width: 260 },
  { field: "product_name", headerName: "Product", width: 140 },
  {
    field: "severity",
    headerName: "Severity",
    width: 110,
    renderCell: (row) => <SeverityBadge severity={row.severity} />,
  },
  {
    field: "is_repeat",
    headerName: "Repeat",
    width: 90,
    renderCell: (row) => row.is_repeat ? (
      <WarningAmberIcon sx={{ color: "#EF4444", fontSize: 18 }} titleAccess="Repeat NC" />
    ) : null,
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

export default function NCListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<NCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ncService.list()
      .then(setRows)
      .catch(() => setError("Failed to load NCs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Non-Conformance</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/nonconformance/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          Report NC
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/nonconformance/${id}`)} />
      )}
    </Box>
  );
}
