import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { batchRecordsService, type BatchProductionRecord, type BPRStep } from "../../services/batchRecords.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import AIRemarkField from "../../components/common/AIRemarkField";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const STATUS_ORDER = ["issued", "in_progress", "completed", "released"];
const STATUS_LABELS: Record<string, string> = { issued: "Issued", in_progress: "In Progress", completed: "Completed", released: "Released" };
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  issued: { bg: "#EEF2FF", color: "#667eea" },
  in_progress: { bg: "#FEF3C7", color: "#92400E" },
  completed: { bg: "#DBEAFE", color: "#1E40AF" },
  released: { bg: "#D1FAE5", color: "#065F46" },
};

function buildSteps(record: BatchProductionRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: STATUS_LABELS[s] || s,
    completed: i < currentIdx, current: i === currentIdx,
  }));
}

export default function BPRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<BatchProductionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [esigOpen, setEsigOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [aiRemark, setAiRemark] = useState("");
  const [aiRemarkConfirmed, setAiRemarkConfirmed] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try { setRecord(await batchRecordsService.getBPR(id)); }
    catch { setError("Failed to load batch production record."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const doRelease = async (password: string) => {
    if (!id) return;
    setTransitioning(true);
    try { await batchRecordsService.releaseBatch(id, password, aiRemark || undefined); await load(); }
    catch (e: unknown) { setError((e as Error).message || "Release failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  const handleStartRelease = () => {
    setAiRemark("");
    setAiRemarkConfirmed(false);
    setRemarkDialogOpen(true);
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const statusStyle = STATUS_COLORS[record.status] || { bg: "#F3F4F6", color: "#374151" };
  const steps: BPRStep[] = record.steps || [];
  const deviationCount = steps.filter((s) => s.deviation_triggered).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/batch-records")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>{record.bpr_number || record.batch_number}</Typography>
            {deviationCount > 0 && (
              <Chip label={`${deviationCount} Deviation(s)`} size="small"
                icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {record.mbr_detail?.product_name || "Batch Production Record"} · MFG: {record.manufacturing_date}
          </Typography>
        </Box>
        <Chip label={STATUS_LABELS[record.status]} sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }} />
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {record.status === "completed" && (
          <Button variant="contained" onClick={handleStartRelease} disabled={transitioning}
            sx={{ bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }}>
            Release Batch
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Steps Total", value: steps.length, color: "#667eea" },
          { label: "Completed", value: steps.filter((s) => s.performed_at).length, color: "#10B981" },
          { label: "Deviations", value: deviationCount, color: "#EF4444" },
          { label: "Yield", value: record.yield_percentage ? `${record.yield_percentage}%` : "—", color: "#F59E0B" },
        ].map((k) => (
          <Grid size={{ xs: 6, sm: 3 }} key={k.label}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${k.color}20`, textAlign: "center" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                <Typography variant="h5" fontWeight={800} color={k.color}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label={`Steps (${steps.length})`} />
        <Tab label="Workflow" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>BPR Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "BPR Number", value: record.bpr_number || record.batch_number },
                  { label: "Product", value: record.mbr_detail?.product_name },
                  { label: "MBR Reference", value: record.mbr_detail?.mbr_number },
                  { label: "Batch Number", value: record.batch_number },
                  { label: "Manufacturing Date", value: record.manufacturing_date },
                  { label: "Expiry Date", value: record.expiry_date },
                  { label: "Yield %", value: record.yield_percentage ? `${record.yield_percentage}%` : undefined },
                  { label: "Status", value: STATUS_LABELS[record.status] },
                ].map(({ label, value }) => value !== undefined && (
                  <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value || "—"}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Status</Typography>
                <WorkflowTimeline steps={buildSteps(record)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          {deviationCount > 0 && (
            <CardContent sx={{ borderBottom: "1px solid #e2e8f0" }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {deviationCount} step value(s) recorded outside the expected range. A deviation
                has been created automatically for each. AI has drafted an initial remark below —
                copy it into the linked deviation record.
              </Alert>
              <AIRemarkField
                module="batch_records"
                recordId={record.id}
                approverRole="production_supervisor"
                stage="step_deviation"
                value=""
                onRemarkChange={() => {}}
                onConfirmChange={() => {}}
              />
            </CardContent>
          )}
          {steps.length === 0 ? (
            <CardContent><Alert severity="info">No steps recorded yet.</Alert></CardContent>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Step</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actual Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>In Range</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Performed At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Deviation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {steps.map((step, idx) => (
                  <TableRow key={step.id || idx} hover
                    sx={{ bgcolor: step.deviation_triggered ? "#FFF5F5" : "inherit" }}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{step.actual_value || "—"}</TableCell>
                    <TableCell>
                      {step.in_range === undefined ? "—" : (
                        <Chip label={step.in_range ? "Yes" : "No"} size="small"
                          sx={{ bgcolor: step.in_range ? "#D1FAE5" : "#FEE2E2", color: step.in_range ? "#065F46" : "#991B1B" }} />
                      )}
                    </TableCell>
                    <TableCell>{step.performed_by || "—"}</TableCell>
                    <TableCell>{step.performed_at ? new Date(step.performed_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      {step.deviation_triggered && (
                        <Chip label="DEV Created" size="small"
                          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                          sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent><WorkflowTimeline steps={buildSteps(record)} /></CardContent>
        </Card>
      )}

      <Dialog open={remarkDialogOpen} onClose={() => setRemarkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Release Remark — {record.batch_number}</DialogTitle>
        <DialogContent>
          <AIRemarkField
            module="batch_records"
            recordId={record.id}
            approverRole="batch_release_production"
            stage="bpr_completion"
            value={aiRemark}
            onRemarkChange={setAiRemark}
            onConfirmChange={setAiRemarkConfirmed}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemarkDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!aiRemarkConfirmed}
            onClick={() => { setRemarkDialogOpen(false); setEsigOpen(true); }}
          >
            Continue to E-Signature
          </Button>
        </DialogActions>
      </Dialog>

      <ESignatureDialog open={esigOpen}
        title={`Release Batch ${record.batch_number}`}
        meaning={aiRemark || "I confirm this batch release decision"}
        onConfirm={doRelease}
        onClose={() => setEsigOpen(false)} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${record.batch_number}`} entries={[]} />
    </Box>
  );
}
