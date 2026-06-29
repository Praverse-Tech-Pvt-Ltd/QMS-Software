import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { complaintsService, type ComplaintRecord } from "../../services/complaints.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import SeverityBadge, { type SeverityLevel } from "../../components/common/SeverityBadge";
import ActionMatrix, { type ActionItem } from "../../components/common/ActionMatrix";
import { aiService, toActionMatrixItems } from "../../services/ai.service";

const STATUS_ORDER = ["new", "in_investigation", "pending_closure", "closed"];
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_investigation: "In Investigation",
  pending_closure: "Pending Closure",
  closed: "Closed",
};
// Complaint severity (low/medium/high/critical) maps onto the 4-level SeverityBadge palette
const SEVERITY_MAP: Record<string, SeverityLevel> = {
  low: "observation", medium: "minor", high: "major", critical: "critical",
};

function buildSteps(record: ComplaintRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: STATUS_LABELS[s] || s,
    completed: i < currentIdx, current: i === currentIdx,
    user: i <= currentIdx ? record.created_by_detail?.full_name : undefined,
  }));
}

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ComplaintRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsLoaded, setActionsLoaded] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      setRecord(await complaintsService.getById(id));
    } catch { setError("Failed to load complaint."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (tab !== 2 || actionsLoaded || !record || !id) return;
    setActionsLoading(true);
    setActionsLoaded(true);
    aiService.extractActions([record.description || ""], "Complaint", id)
      .then((results) => setActions(toActionMatrixItems(results)))
      .catch(() => setActions([]))
      .finally(() => setActionsLoading(false));
  }, [tab, actionsLoaded, record, id]);

  const handleTransition = (action: string) => {
    if (action === "closed") { setPendingAction(action); setEsigOpen(true); }
    else doTransition(action);
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id) return;
    setTransitioning(true);
    try {
      await complaintsService.transition(id, action, undefined, esigPassword);
      await load();
    } catch (e: unknown) { setError((e as Error).message || "Transition failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const nextActions: Record<string, string> = { new: "in_investigation", in_investigation: "pending_closure", pending_closure: "closed" };
  const nextActionLabels: Record<string, string> = { in_investigation: "Start Investigation", pending_closure: "Request Closure", closed: "Close Complaint" };
  const nextAction = nextActions[record.status];
  const today = new Date();
  const isOverdue = record.response_deadline && new Date(record.response_deadline) < today && record.status !== "closed";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/complaints")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>{record.complaint_number}</Typography>
            {isOverdue && <Chip label="OVERDUE" size="small" icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
              sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />}
          </Box>
          <Typography variant="body2" color="text.secondary">{record.description?.substring(0, 120)}</Typography>
        </Box>
        <SeverityBadge severity={SEVERITY_MAP[record.severity] ?? "minor"} size="medium" />
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {nextAction && (
          <Button variant="contained" onClick={() => handleTransition(nextAction)} disabled={transitioning}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {transitioning ? <CircularProgress size={18} /> : nextActionLabels[nextAction]}
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label="Workflow" />
        <Tab label="Actions" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Complaint Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "Complaint #", value: record.complaint_number },
                  { label: "Product", value: record.product_name || (record as unknown as Record<string, unknown>).product as string },
                  { label: "Batch/Lot", value: record.batch_number || (record as unknown as Record<string, unknown>).batch_lot as string },
                  { label: "Complainant Type", value: (record as unknown as Record<string, unknown>).complainant_type as string },
                  { label: "Severity", value: record.severity },
                  { label: "Received Date", value: (record as unknown as Record<string, unknown>).received_date as string },
                  { label: "Response Deadline", value: record.response_deadline },
                  { label: "Regulatory Reportable", value: (record as unknown as Record<string, unknown>).regulatory_reportable ? "Yes" : "No" },
                  { label: "Status", value: STATUS_LABELS[record.status] || record.status },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value || "—"}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                <Typography variant="body2">{record.description}</Typography>
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
          <CardContent>
            <WorkflowTimeline steps={buildSteps(record)} />
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>AI-Extracted Action Items</Typography>
            {actionsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={24} /></Box>
            ) : (
              <ActionMatrix actions={actions} onChange={setActions} recordType="Complaint" recordId={id} />
            )}
          </CardContent>
        </Card>
      )}

      <ESignatureDialog open={esigOpen} title={`Close Complaint ${record.complaint_number}`}
        onConfirm={async (pw) => { if (pendingAction) await doTransition(pendingAction, pw); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${record.complaint_number}`} entries={[]} />
    </Box>
  );
}
