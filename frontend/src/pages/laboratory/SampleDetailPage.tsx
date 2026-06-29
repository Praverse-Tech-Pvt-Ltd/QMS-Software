import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { laboratoryService, type Sample, type TestRequest, type TestResult } from "../../services/laboratory.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import AIRemarkField from "../../components/common/AIRemarkField";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const STATUS_ORDER = ["received", "testing", "completed", "released", "rejected"];
const STATUS_LABELS: Record<string, string> = {
  received: "Received", testing: "Testing", completed: "Completed",
  released: "Released", rejected: "Rejected",
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  received: { bg: "#EEF2FF", color: "#667eea" },
  testing: { bg: "#FEF3C7", color: "#92400E" },
  completed: { bg: "#DBEAFE", color: "#1E40AF" },
  released: { bg: "#D1FAE5", color: "#065F46" },
  rejected: { bg: "#FEE2E2", color: "#991B1B" },
};

function buildSteps(record: Sample): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: STATUS_LABELS[s] || s,
    completed: i < currentIdx, current: i === currentIdx,
  }));
}

export default function SampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sample, setSample] = useState<Sample | null>(null);
  const [tests, setTests] = useState<TestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coaGenerating, setCoaGenerating] = useState(false);
  const [coaError, setCoaError] = useState<string | null>(null);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [aiRemark, setAiRemark] = useState("");
  const [aiRemarkConfirmed, setAiRemarkConfirmed] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        laboratoryService.getSample(id),
        laboratoryService.listTestRequests({ sample: id }),
      ]);
      setSample(s);
      setTests(t);
    } catch { setError("Failed to load sample."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = (action: string) => {
    if (["released", "rejected"].includes(action)) {
      setPendingAction(action);
      setAiRemark("");
      setAiRemarkConfirmed(false);
      setRemarkDialogOpen(true);
    } else {
      doTransition(action);
    }
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id || !sample) return;
    setTransitioning(true);
    try {
      await laboratoryService.transition(id, action, aiRemark || undefined, esigPassword);
      await load();
    } catch (e: unknown) { setError((e as Error).message || `${action} failed.`); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  const handleGenerateCOA = async () => {
    if (!id || !sample) return;
    setCoaGenerating(true);
    setCoaError(null);
    try {
      const blob = await laboratoryService.generateCOA(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `COA-${sample.sample_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setCoaError("COA generation failed. Ensure test results have been recorded.");
    } finally {
      setCoaGenerating(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!sample) return null;

  const statusStyle = STATUS_COLORS[sample.status] || { bg: "#F3F4F6", color: "#374151" };
  const nextActions: Record<string, string[]> = {
    received: ["testing"], testing: ["completed"], completed: ["released", "rejected"],
  };
  const available = nextActions[sample.status] || [];

  const allResults: TestResult[] = tests.flatMap((t) => t.results || []);
  const failCount = allResults.filter((r) => r.pass_fail === "fail").length;

  return (
    <Box sx={{ p: 3 }}>
      {coaError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCoaError(null)}>{coaError}</Alert>}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/laboratory")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{sample.sample_number}</Typography>
          <Typography variant="body2" color="text.secondary">
            {sample.product_name} · {sample.sample_type} · Received: {sample.received_date}
          </Typography>
        </Box>
        <Chip label={STATUS_LABELS[sample.status]} sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }} />
        {failCount > 0 && <Chip label={`${failCount} FAIL`} sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />}
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleGenerateCOA}
          disabled={coaGenerating || allResults.length === 0}>
          {coaGenerating ? "Generating..." : "Generate COA"}
        </Button>
        {available.map((action) => (
          <Button key={action} variant={["released", "completed"].includes(action) ? "contained" : "outlined"}
            onClick={() => handleTransition(action)} disabled={transitioning}
            sx={action === "released" ? { bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }
              : action === "rejected" ? { color: "#EF4444", borderColor: "#EF4444" }
              : { bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label={`Test Results (${allResults.length})`} />
        <Tab label="Workflow" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Sample Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "Sample Number", value: sample.sample_number },
                  { label: "Product", value: sample.product_name },
                  { label: "Batch/Lot", value: sample.batch_number },
                  { label: "Sample Type", value: sample.sample_type },
                  { label: "Received Date", value: sample.received_date },
                  { label: "Expiry Date", value: sample.expiry_date },
                  { label: "Status", value: STATUS_LABELS[sample.status] },
                  { label: "Test Requests", value: tests.length },
                ].map(({ label, value }) => value !== undefined && (
                  <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{String(value) || "—"}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Status</Typography>
                <WorkflowTimeline steps={buildSteps(sample)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          {allResults.length === 0 ? (
            <CardContent><Alert severity="info">No test results recorded yet.</Alert></CardContent>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Parameter</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Specification</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pass/Fail</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>OOS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allResults.map((r) => (
                  <TableRow key={r.id} hover sx={{ bgcolor: r.pass_fail === "fail" ? "#FFF5F5" : "inherit" }}>
                    <TableCell>{r.parameter}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.result_value}</TableCell>
                    <TableCell>{r.unit || "—"}</TableCell>
                    <TableCell>{r.specification || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.pass_fail.toUpperCase()}
                        size="small"
                        icon={r.pass_fail === "pass" ? <CheckIcon sx={{ fontSize: 14 }} /> : <CloseIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: r.pass_fail === "pass" ? "#D1FAE5" : r.pass_fail === "fail" ? "#FEE2E2" : "#FEF3C7",
                          color: r.pass_fail === "pass" ? "#065F46" : r.pass_fail === "fail" ? "#991B1B" : "#92400E",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {r.oos_triggered && <Chip label="OOS" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />}
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
          <CardContent><WorkflowTimeline steps={buildSteps(sample)} /></CardContent>
        </Card>
      )}

      <Dialog open={remarkDialogOpen} onClose={() => setRemarkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {pendingAction === "released" ? "Release" : "Reject"} Remark — {sample.sample_number}
        </DialogTitle>
        <DialogContent>
          <AIRemarkField
            module="laboratory"
            recordId={sample.id}
            approverRole={pendingAction === "released" ? "batch_release_qa" : "batch_rejection_qa"}
            stage="release"
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
        title={`${pendingAction === "released" ? "Release" : "Reject"} Sample ${sample.sample_number}`}
        meaning={aiRemark || `I confirm this ${pendingAction} decision`}
        onConfirm={async (pw) => { if (pendingAction) await doTransition(pendingAction, pw); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${sample.sample_number}`} entries={[]} />
    </Box>
  );
}
