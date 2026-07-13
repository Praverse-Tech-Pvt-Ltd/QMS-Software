import { Box, Button, Typography, Chip, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import {
  laboratoryService, instrumentsService, type Sample, type TestRequest, type Instrument,
} from "../../services/laboratory.service";
import InstrumentCalibrationDialog from "../../components/laboratory/InstrumentCalibrationDialog";

const INSTRUMENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active: { bg: "#D1FAE5", color: "#065F46" },
  due: { bg: "#FEF3C7", color: "#92400E" },
  overdue: { bg: "#FEE2E2", color: "#991B1B" },
  out_of_service: { bg: "#F3F4F6", color: "#374151" },
};

const INSTRUMENT_COLUMNS: ColumnDef<Instrument>[] = [
  { field: "instrument_id", headerName: "Instrument #", width: 130 },
  { field: "name", headerName: "Name", width: 220 },
  { field: "department", headerName: "Department", width: 150 },
  { field: "last_calibration_date", headerName: "Last Calibration", width: 150 },
  { field: "next_calibration_date", headerName: "Next Calibration", width: 150 },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: (row) => {
      const c = INSTRUMENT_STATUS_COLORS[row.status] || INSTRUMENT_STATUS_COLORS.active;
      return <Chip label={row.status_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    },
  },
];

const SAMPLE_COLUMNS: ColumnDef<Sample>[] = [
  { field: "sample_number", headerName: "Sample #", width: 140 },
  { field: "product", headerName: "Product", width: 220 },
  { field: "sample_type", headerName: "Type", width: 120 },
  { field: "batch_lot", headerName: "Batch", width: 130 },
  { field: "received_date", headerName: "Received", width: 130 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

const TEST_COLUMNS: ColumnDef<TestRequest>[] = [
  { field: "id", headerName: "Request #", width: 140 },
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
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  const loadInstruments = () => instrumentsService.list().then(setInstruments);

  useEffect(() => {
    Promise.all([laboratoryService.listSamples(), laboratoryService.listTestRequests(), instrumentsService.list()])
      .then(([s, t, i]) => { setSamples(s); setTests(t); setInstruments(i); })
      .catch(() => setError("Failed to load laboratory data."))
      .finally(() => setLoading(false));
  }, []);

  const newButtonLabel = tab === 0 ? "New Sample" : tab === 1 ? "New Test Request" : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Laboratory</Typography>
        {newButtonLabel && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate(tab === 0 ? "/laboratory/samples/new" : "/laboratory/tests/new")}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {newButtonLabel}
          </Button>
        )}
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Samples" />
        <Tab label="Test Requests" />
        <Tab label="Instruments" />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : tab === 0 ? (
        <ModuleTable columns={SAMPLE_COLUMNS} rows={samples} onView={(id) => navigate(`/laboratory/samples/${id}`)} />
      ) : tab === 1 ? (
        <ModuleTable columns={TEST_COLUMNS} rows={tests} onView={(id) => navigate(`/laboratory/tests/${id}`)} />
      ) : (
        <ModuleTable
          columns={INSTRUMENT_COLUMNS}
          rows={instruments}
          onView={(id) => setSelectedInstrument(instruments.find((i) => i.id === id) || null)}
        />
      )}

      {selectedInstrument && (
        <InstrumentCalibrationDialog
          instrument={selectedInstrument}
          open={!!selectedInstrument}
          onClose={() => setSelectedInstrument(null)}
          onUpdated={loadInstruments}
        />
      )}
    </Box>
  );
}
