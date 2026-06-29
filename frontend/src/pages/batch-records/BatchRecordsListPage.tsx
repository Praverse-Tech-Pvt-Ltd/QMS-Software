import { Box, Button, Typography, Chip, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { batchRecordsService, type MasterBatchRecord, type BatchProductionRecord } from "../../services/batchRecords.service";

const MBR_COLUMNS: ColumnDef<MasterBatchRecord>[] = [
  { field: "mbr_number", headerName: "MBR #", width: 140 },
  { field: "product_name", headerName: "Product", width: 240 },
  { field: "product_code", headerName: "Code", width: 120 },
  { field: "version", headerName: "Version", width: 100 },
  { field: "batch_size", headerName: "Batch Size", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

const BPR_COLUMNS: ColumnDef<BatchProductionRecord>[] = [
  { field: "bpr_number", headerName: "BPR #", width: 140 },
  { field: "batch_number", headerName: "Batch #", width: 140 },
  { field: "manufacturing_date", headerName: "Mfg Date", width: 130 },
  { field: "expiry_date", headerName: "Expiry", width: 120 },
  { field: "yield_percentage", headerName: "Yield %", width: 100 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

export default function BatchRecordsListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [mbrs, setMBRs] = useState<MasterBatchRecord[]>([]);
  const [bprs, setBPRs] = useState<BatchProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([batchRecordsService.listMBR(), batchRecordsService.listBPR()])
      .then(([m, b]) => { setMBRs(m); setBPRs(b); })
      .catch(() => setError("Failed to load batch records."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Batch Records</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate(tab === 0 ? "/batch-records/mbr/new" : "/batch-records/bpr/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          {tab === 0 ? "New MBR" : "New BPR"}
        </Button>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Master Batch Records" />
        <Tab label="Batch Production Records" />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : tab === 0 ? (
        <ModuleTable columns={MBR_COLUMNS} rows={mbrs} onView={(id) => navigate(`/batch-records/mbr/${id}`)} />
      ) : (
        <ModuleTable columns={BPR_COLUMNS} rows={bprs} onView={(id) => navigate(`/batch-records/bpr/${id}`)} />
      )}
    </Box>
  );
}
