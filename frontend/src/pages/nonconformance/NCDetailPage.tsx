import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { ncService, type NCRecord } from "../../services/nc.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import SeverityBadge from "../../components/common/SeverityBadge";

const STATUS_ORDER = ["open", "dispositioned", "closed"];
const STATUS_LABELS: Record<string, string> = { open: "Open", dispositioned: "Dispositioned", closed: "Closed" };

interface DispositionDialogProps {
  open: boolean;
  ncId: string;
  onClose: () => void;
  onDone: () => void;
}

function DispositionDialog({ open, ncId, onClose, onDone }: DispositionDialogProps) {
  const [decision, setDecision] = useState<"release" | "rework" | "retest" | "reject" | "destroy">("release");
  const [justification, setJustification] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!justification.trim()) { setError("Justification is required."); return; }
    if (!password) { setError("E-signature password is required."); return; }
    setLoading(true);
    setError(null);
    try {
      await ncService.dispose(ncId, { decision, justification, esig_password: password });
      onDone();
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message || "Disposition failed.");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>NC Disposition</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action requires an electronic signature per 21 CFR Part 11.
        </Alert>
        <TextField select label="Disposition Decision" fullWidth required
          value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)} sx={{ mt: 1, mb: 2 }}>
          {(["release", "rework", "retest", "reject", "destroy"] as const).map((d) => (
            <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
          ))}
        </TextField>
        <TextField label="Justification (min 30 characters)" multiline rows={3} fullWidth required
          value={justification} onChange={(e) => setJustification(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="E-Signature Password" type="password" fullWidth required
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={loading || !justification || !password || justification.length < 30}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          {loading ? <CircularProgress size={18} /> : "Sign & Dispose"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function buildSteps(record: NCRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: STATUS_LABELS[s] || s,
    completed: i < currentIdx, current: i === currentIdx,
    user: i <= currentIdx ? record.created_by_detail?.full_name : undefined,
  }));
}

export default function NCDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<NCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [esigOpen, setEsigOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try { setRecord(await ncService.getById(id)); }
    catch { setError("Failed to load NC record."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleClose = async (password: string) => {
    if (!id) return;
    setTransitioning(true);
    try {
      await ncService.transition(id, "closed", undefined, password);
      await load();
    } catch (e: unknown) { setError((e as Error).message || "Close failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/nonconformance")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>{record.nc_number}</Typography>
            {record.is_repeat && <Chip label="REPEAT" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />}
            {record.on_hold && <Chip label="ON HOLD" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }} />}
          </Box>
          <Typography variant="body2" color="text.secondary">{record.description?.substring(0, 120)}</Typography>
        </Box>
        <SeverityBadge severity={record.severity} size="medium" />
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {record.status === "open" && (
          <Button variant="outlined" startIcon={<LockOpenIcon />} onClick={() => setDisposeOpen(true)}>
            Dispose
          </Button>
        )}
        {record.status === "dispositioned" && (
          <Button variant="contained" onClick={() => setEsigOpen(true)} disabled={transitioning}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Close NC
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label="Workflow" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>NC Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "NC Number", value: record.nc_number },
                  { label: "Product", value: record.product_name || (record as unknown as Record<string, unknown>).product as string },
                  { label: "Batch / Lot", value: record.batch_number || (record as unknown as Record<string, unknown>).batch_lot as string },
                  { label: "Quantity Affected", value: `${record.quantity_affected} ${record.unit || ""}` },
                  { label: "Defect Category", value: record.defect_category || (record as unknown as Record<string, unknown>).defect_description as string },
                  { label: "Severity", value: record.severity },
                  { label: "Hold Status", value: (record as unknown as Record<string, unknown>).hold_status ? "On Hold" : "Released" },
                  { label: "Status", value: STATUS_LABELS[record.status] },
                ].map(({ label, value }) => (
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
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Workflow</Typography>
                <WorkflowTimeline steps={buildSteps(record)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent><WorkflowTimeline steps={buildSteps(record)} /></CardContent>
        </Card>
      )}

      <DispositionDialog open={disposeOpen} ncId={id!}
        onClose={() => setDisposeOpen(false)} onDone={load} />
      <ESignatureDialog open={esigOpen} title={`Close NC ${record.nc_number}`}
        onConfirm={handleClose}
        onClose={() => setEsigOpen(false)} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${record.nc_number}`} entries={[]} />
    </Box>
  );
}
