import { Box, Button, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { complaintsService, type ComplaintRecord } from "../../services/complaints.service";
import SeverityBadge, { type SeverityLevel } from "../../components/common/SeverityBadge";

// Complaint severity (low/medium/high/critical) maps onto the 4-level SeverityBadge palette
const SEVERITY_MAP: Record<string, SeverityLevel> = {
  low: "observation", medium: "minor", high: "major", critical: "critical",
};

const COLUMNS: ColumnDef<ComplaintRecord>[] = [
  { field: "complaint_number", headerName: "Complaint #", width: 150 },
  { field: "title", headerName: "Title", width: 280 },
  { field: "complaint_type", headerName: "Type", width: 130 },
  {
    field: "severity",
    headerName: "Severity",
    width: 110,
    renderCell: (row) => <SeverityBadge severity={SEVERITY_MAP[row.severity] ?? "minor"} />,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
  { field: "response_deadline", headerName: "Deadline", width: 130 },
];

export default function ComplaintsListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    complaintsService.list()
      .then(setRows)
      .catch(() => setError("Failed to load complaints."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Complaints</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/complaints/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Complaint
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/complaints/${id}`)} />
      )}
    </Box>
  );
}
