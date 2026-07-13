import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Tabs, Tab, Button, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import {
  environmentalService, type EMSamplingPlan, type EMResult, type EMTrend,
} from "../../services/environmental.service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const CLASSIFICATIONS = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "D", label: "Grade D" },
];
const MONITORING_TYPES = [
  { value: "viable", label: "Viable — microbial" },
  { value: "non_viable", label: "Non-viable — particles" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  normal: { bg: "#D1FAE5", color: "#065F46" },
  alert: { bg: "#FEF3C7", color: "#92400E" },
  action: { bg: "#FEE2E2", color: "#991B1B" },
};

const PLAN_COLUMNS: ColumnDef<EMSamplingPlan>[] = [
  { field: "area", headerName: "Area", width: 220 },
  { field: "classification_display", headerName: "Classification", width: 130 },
  { field: "monitoring_type_display", headerName: "Type", width: 180 },
  { field: "frequency", headerName: "Frequency", width: 130 },
  { field: "alert_limit", headerName: "Alert Limit", width: 110 },
  { field: "action_limit", headerName: "Action Limit", width: 110 },
];

const RESULT_COLUMNS: ColumnDef<EMResult>[] = [
  { field: "area", headerName: "Area", width: 200 },
  { field: "sampling_date", headerName: "Date", width: 130 },
  { field: "result_value", headerName: "Result", width: 100 },
  { field: "sampled_by_name", headerName: "Sampled By", width: 160 },
  {
    field: "result_status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => {
      const c = STATUS_COLORS[row.result_status] || STATUS_COLORS.normal;
      return <Chip label={row.result_status_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    },
  },
];

const EMPTY_PLAN_FORM: {
  area: string; classification: EMSamplingPlan["classification"]; monitoring_type: EMSamplingPlan["monitoring_type"];
  frequency: string; action_limit: string; alert_limit: string;
} = { area: "", classification: "C", monitoring_type: "viable", frequency: "", action_limit: "", alert_limit: "" };

const EMPTY_RESULT_FORM = { sampling_plan: "", sampling_date: new Date().toISOString().slice(0, 10), result_value: "" };

export default function EnvironmentalPage() {
  const [tab, setTab] = useState(0);
  const [plans, setPlans] = useState<EMSamplingPlan[]>([]);
  const [results, setResults] = useState<EMResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN_FORM);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultForm, setResultForm] = useState(EMPTY_RESULT_FORM);

  const [trendArea, setTrendArea] = useState("");
  const [trendMonths, setTrendMonths] = useState(6);
  const [trend, setTrend] = useState<EMTrend | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([environmentalService.listSamplingPlans(), environmentalService.listResults()])
      .then(([p, r]) => { setPlans(p); setResults(r); })
      .catch(() => setError("Failed to load environmental monitoring data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const areas = useMemo(() => Array.from(new Set(plans.map((p) => p.area))), [plans]);

  useEffect(() => {
    if (tab === 2 && !trendArea && areas.length) setTrendArea(areas[0]);
  }, [tab, areas, trendArea]);

  useEffect(() => {
    if (tab !== 2 || !trendArea) return;
    setTrendLoading(true);
    environmentalService.getTrends(trendArea, trendMonths)
      .then(setTrend)
      .catch(() => setError("Failed to load trend data."))
      .finally(() => setTrendLoading(false));
  }, [tab, trendArea, trendMonths]);

  const handleCreatePlan = async () => {
    if (!planForm.area.trim() || !planForm.action_limit || !planForm.alert_limit) return;
    await environmentalService.createSamplingPlan(planForm);
    setPlanDialogOpen(false);
    setPlanForm(EMPTY_PLAN_FORM);
    load();
  };

  const handleCreateResult = async () => {
    if (!resultForm.sampling_plan || !resultForm.result_value) return;
    await environmentalService.createResult(resultForm);
    setResultDialogOpen(false);
    setResultForm(EMPTY_RESULT_FORM);
    load();
  };

  const chartData = trend ? {
    labels: trend.dates,
    datasets: [
      {
        label: "Result",
        data: trend.values,
        borderColor: "#667eea",
        backgroundColor: "#667eea",
        tension: 0.2,
      },
      {
        label: "Alert Limit",
        data: trend.dates.map(() => trend.alert_limit),
        borderColor: "#F59E0B",
        borderDash: [6, 4],
        pointRadius: 0,
      },
      {
        label: "Action Limit",
        data: trend.dates.map(() => trend.action_limit),
        borderColor: "#EF4444",
        borderDash: [6, 4],
        pointRadius: 0,
      },
    ],
  } : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Environmental Monitoring</Typography>
        {tab === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPlanDialogOpen(true)}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            New Sampling Plan
          </Button>
        )}
        {tab === 1 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setResultDialogOpen(true)}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Record Result
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Sampling Plans" />
        <Tab label="Results" />
        <Tab label="Trend Charts" />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : tab === 0 ? (
        <ModuleTable columns={PLAN_COLUMNS} rows={plans} />
      ) : tab === 1 ? (
        <ModuleTable columns={RESULT_COLUMNS} rows={results} />
      ) : (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField select label="Area" size="small" sx={{ minWidth: 220 }} value={trendArea}
              onChange={(e) => setTrendArea(e.target.value)}>
              {areas.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            <TextField select label="Months" size="small" sx={{ minWidth: 120 }} value={trendMonths}
              onChange={(e) => setTrendMonths(Number(e.target.value))}>
              {[3, 6, 12, 24].map((m) => <MenuItem key={m} value={m}>{m} months</MenuItem>)}
            </TextField>
          </Box>
          {trendLoading ? <CircularProgress /> : !trend || trend.dates.length === 0 ? (
            <Alert severity="info">No results recorded for this area in the selected period.</Alert>
          ) : (
            <Box sx={{ maxWidth: 900 }}>
              {chartData && <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />}
            </Box>
          )}
        </Box>
      )}

      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Sampling Plan</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Area" fullWidth required value={planForm.area} autoFocus
            onChange={(e) => setPlanForm({ ...planForm, area: e.target.value })} />
          <TextField select label="Classification" fullWidth value={planForm.classification}
            onChange={(e) => setPlanForm({ ...planForm, classification: e.target.value as EMSamplingPlan["classification"] })}>
            {CLASSIFICATIONS.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>
          <TextField select label="Monitoring Type" fullWidth value={planForm.monitoring_type}
            onChange={(e) => setPlanForm({ ...planForm, monitoring_type: e.target.value as EMSamplingPlan["monitoring_type"] })}>
            {MONITORING_TYPES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>
          <TextField label="Frequency" fullWidth placeholder="e.g. Weekly" value={planForm.frequency}
            onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Alert Limit" type="number" fullWidth required value={planForm.alert_limit}
              onChange={(e) => setPlanForm({ ...planForm, alert_limit: e.target.value })} />
            <TextField label="Action Limit" type="number" fullWidth required value={planForm.action_limit}
              onChange={(e) => setPlanForm({ ...planForm, action_limit: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePlan}
            disabled={!planForm.area.trim() || !planForm.action_limit || !planForm.alert_limit}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Record EM Result</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField select label="Sampling Plan" fullWidth required value={resultForm.sampling_plan}
            onChange={(e) => setResultForm({ ...resultForm, sampling_plan: e.target.value })}>
            {plans.map((p) => <MenuItem key={p.id} value={p.id}>{p.area} — {p.monitoring_type_display}</MenuItem>)}
          </TextField>
          <TextField label="Sampling Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
            value={resultForm.sampling_date} onChange={(e) => setResultForm({ ...resultForm, sampling_date: e.target.value })} />
          <TextField label="Result Value" type="number" fullWidth required value={resultForm.result_value}
            onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResultDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateResult}
            disabled={!resultForm.sampling_plan || !resultForm.result_value}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
