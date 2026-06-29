import { Box, Button, Typography, Chip, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { laboratoryService, type Sample, type TestRequest } from "../../services/laboratory.service";

const SAMPLE_COLUMNS: ColumnDef<Sample>[] = [
  { field: "sample_number", headerName: "Sample #", width: 140 },
  { field: "product_name", headerName: "Product", width: 220 },
  { field: "sample_type", headerName: "Type", width: 120 },
  { field: "batch_number", headerName: "Batch", width: 130 },
  { field: "received_date", headerName: "Received", width: 130 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

const TEST_COLUMNS: ColumnDef<TestRequest>[] = [
  { field: "request_number", headerName: "Request #", width: 140 },
  { field: "test_name", headerName: "Test", width: 260 },
  { field: "due_date", headerName: "Due Date", width: 130 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

export default function LaboratoryListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [tests, setTests] = useState<TestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([laboratoryService.listSamples(), laboratoryService.listTestRequests()])
      .then(([s, t]) => { setSamples(s); setTests(t); })
      .catch(() => setError("Failed to load laboratory data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Laboratory</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate(tab === 0 ? "/laboratory/samples/new" : "/laboratory/tests/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          {tab === 0 ? "New Sample" : "New Test Request"}
        </Button>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Samples" />
        <Tab label="Test Requests" />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : tab === 0 ? (
        <ModuleTable columns={SAMPLE_COLUMNS} rows={samples} onView={(id) => navigate(`/laboratory/samples/${id}`)} />
      ) : (
        <ModuleTable columns={TEST_COLUMNS} rows={tests} onView={(id) => navigate(`/laboratory/tests/${id}`)} />
      )}
    </Box>
  );
}
