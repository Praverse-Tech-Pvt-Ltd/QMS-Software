import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip, Table,
  TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import { risksService, type RiskRecord } from "../../services/risks.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import RiskScoreBadge from "../../components/common/RiskScoreBadge";

const STATUS_ORDER = ["open", "mitigated", "accepted", "closed"];
const STATUS_LABELS: Record<string, string> = { open: "Open", mitigated: "Mitigated", accepted: "Accepted", closed: "Closed" };

const RISK_LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#D1FAE5", color: "#065F46" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  High: { bg: "#FFEDD5", color: "#9A3412" },
  Critical: { bg: "#FEE2E2", color: "#991B1B" },
};

function buildSteps(record: RiskRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: STATUS_LABELS[s] || s,
    completed: i < currentIdx, current: i === currentIdx,
  }));
}

export default function RiskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<RiskRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try { setRecord(await risksService.getById(id)); }
    catch { setError("Failed to load risk record."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = (action: string) => {
    if (["accepted", "closed"].includes(action)) { setPendingAction(action); setEsigOpen(true); }
    else doTransition(action);
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id) return;
    setTransitioning(true);
    try { await risksService.transition(id, action, undefined, esigPassword); await load(); }
    catch (e: unknown) { setError((e as Error).message || "Transition failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const lvl = record.risk_level || "Low";
  const lvlColor = RISK_LEVEL_COLORS[lvl] || { bg: "#F3F4F6", color: "#374151" };
  const nextActions: Record<string, string[]> = {
    open: ["mitigated", "accepted"], mitigated: ["closed", "open"], accepted: ["closed"],
  };
  const available = nextActions[record.status] || [];

  const actualRpn = record.rpn || (record.severity * record.occurrence * record.detectability);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/risks")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{(record as unknown as Record<string, unknown>).risk_id as string || `RISK-${id}`}</Typography>
          <Typography variant="body2" color="text.secondary">{record.description?.substring(0, 120)}</Typography>
        </Box>
        <Chip label={lvl} sx={{ bgcolor: lvlColor.bg, color: lvlColor.color, fontWeight: 700 }} />
        <RiskScoreBadge level={lvl as "Low" | "Medium" | "High" | "Critical"} score={actualRpn} />
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {available.map((action) => (
          <Button key={action} variant={action === "closed" ? "contained" : "outlined"}
            onClick={() => handleTransition(action)} disabled={transitioning}
            sx={action === "closed" ? { bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } } : {}}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>

      {/* FMEA score strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Severity (S)", value: record.severity, color: "#EF4444" },
          { label: "Occurrence (O)", value: record.occurrence, color: "#F59E0B" },
          { label: "Detection (D)", value: record.detectability, color: "#3B82F6" },
          { label: "RPN (S×O×D)", value: actualRpn, color: lvlColor.color },
        ].map((k) => (
          <Grid size={{ xs: 6, sm: 3 }} key={k.label}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${k.color}20`, textAlign: "center" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                <Typography variant="h4" fontWeight={800} color={k.color}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label={`Mitigations (${record.mitigations?.length || 0})`} />
        <Tab label="Workflow" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Risk Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "Category", value: record.risk_category },
                  { label: "Process / Product", value: record.process || record.product },
                  { label: "Risk Level", value: record.risk_level },
                  { label: "Status", value: STATUS_LABELS[record.status] },
                  { label: "Created", value: new Date(record.created_at).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value || "—"}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                <Typography variant="body2">{record.description}</Typography>
                {record.residual && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Residual Risk After Mitigation</Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip label={`S: ${record.residual.residual_severity}`} size="small" />
                      <Chip label={`O: ${record.residual.residual_occurrence}`} size="small" />
                      <Chip label={`D: ${record.residual.residual_detectability}`} size="small" />
                      <Chip label={`RPN: ${record.residual.residual_rpn}`} size="small"
                        sx={{ bgcolor: "#EEF2FF", color: "#667eea", fontWeight: 700 }} />
                    </Box>
                  </>
                )}
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
          {!record.mitigations?.length ? (
            <CardContent><Alert severity="info">No mitigations recorded yet.</Alert></CardContent>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {record.mitigations.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.description}</TableCell>
                    <TableCell>{m.owner}</TableCell>
                    <TableCell>{m.due_date}</TableCell>
                    <TableCell>
                      <Chip label={m.status} size="small" sx={{ textTransform: "capitalize" }} />
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

      <ESignatureDialog open={esigOpen} title={`${pendingAction === "closed" ? "Close" : "Accept"} Risk`}
        onConfirm={async (pw) => { if (pendingAction) await doTransition(pendingAction, pw); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title="Audit Trail — Risk" entries={[]} />
    </Box>
  );
}
