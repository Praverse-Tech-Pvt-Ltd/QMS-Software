import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { auditsService, type AuditRecord, type Finding } from "../../services/audits.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";
import HistoryIcon from "@mui/icons-material/History";
import SeverityBadge from "../../components/common/SeverityBadge";
import ActionMatrix, { type ActionItem } from "../../components/common/ActionMatrix";
import { aiService, toActionMatrixItems } from "../../services/ai.service";

const STATUS_ORDER = ["planned", "in_progress", "completed", "closed"];
const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  planned: { bg: "#EEF2FF", color: "#667eea" },
  in_progress: { bg: "#FEF3C7", color: "#92400E" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  closed: { bg: "#F3F4F6", color: "#374151" },
};
function buildSteps(record: AuditRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s,
    label: STATUS_LABELS[s],
    completed: i < currentIdx,
    current: i === currentIdx,
    user: i <= currentIdx ? record.created_by_detail?.full_name : undefined,
  }));
}

interface AddFindingDialogProps {
  open: boolean;
  auditId: string;
  onClose: () => void;
  onAdded: () => void;
}

function AddFindingDialog({ open, auditId, onClose, onAdded }: AddFindingDialogProps) {
  const [form, setForm] = useState<{ description: string; severity: "observation" | "minor" | "major" | "critical"; reference_clause: string; due_date: string }>({ description: "", severity: "minor", reference_clause: "", due_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await auditsService.addFinding(auditId, form);
      onAdded();
      onClose();
      setForm({ description: "", severity: "minor" as const, reference_clause: "", due_date: "" });
    } catch {
      setError("Failed to add finding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Audit Finding</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Description" multiline rows={3} fullWidth required
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          select label="Severity" fullWidth required
          value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as "observation" | "minor" | "major" | "critical" })}
          sx={{ mb: 2 }}
        >
          {["observation", "minor", "major", "critical"].map((s) => (
            <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Reference Clause (SOP / 21 CFR §)" fullWidth
          value={form.reference_clause} onChange={(e) => setForm({ ...form, reference_clause: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
          value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.description}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          {loading ? <CircularProgress size={18} /> : "Add Finding"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AuditRecord | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [addFindingOpen, setAddFindingOpen] = useState(false);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionsLoaded, setActionsLoaded] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [rec, fins] = await Promise.all([
        auditsService.getById(id),
        auditsService.getFindings(id),
      ]);
      setRecord(rec);
      setFindings(fins);
    } catch {
      setError("Failed to load audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (tab !== 3 || actionsLoaded || findings.length === 0 || !id) return;
    setActionsLoading(true);
    setActionsLoaded(true);
    aiService.extractActions(findings.map((f) => f.description), "Audit", id)
      .then((results) => setActions(toActionMatrixItems(results)))
      .catch(() => setActions([]))
      .finally(() => setActionsLoading(false));
  }, [tab, actionsLoaded, findings, id]);

  const handleTransition = (action: string) => {
    if (action === "closed") {
      setPendingAction(action);
      setEsigOpen(true);
    } else {
      doTransition(action);
    }
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id) return;
    setTransitioning(true);
    try {
      await auditsService.transition(id, action, undefined, esigPassword);
      await load();
    } catch (e: unknown) {
      setError((e as Error).message || "Transition failed.");
    } finally {
      setTransitioning(false);
      setEsigOpen(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const statusStyle = STATUS_COLORS[record.status] || { bg: "#F3F4F6", color: "#374151" };

  const nextActions: Record<string, string> = {
    planned: "in_progress",
    in_progress: "completed",
    completed: "closed",
  };
  const nextAction = nextActions[record.status];
  const nextLabel: Record<string, string> = {
    in_progress: "Start Audit",
    completed: "Mark Completed",
    closed: "Close Audit",
  };

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const openCount = findings.filter((f) => f.status === "open").length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/audits")}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {record.audit_number}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {record.scope?.substring(0, 120)}
          </Typography>
        </Box>
        <Chip
          label={STATUS_LABELS[record.status] || record.status}
          sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700, fontSize: "0.85rem" }}
        />
        <Tooltip title="Audit Trail">
          <IconButton onClick={() => setAuditDrawerOpen(true)}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        {nextAction && (
          <Button
            variant="contained"
            onClick={() => handleTransition(nextAction)}
            disabled={transitioning}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
          >
            {transitioning ? <CircularProgress size={18} /> : nextLabel[nextAction] || nextAction}
          </Button>
        )}
      </Box>

      {/* KPI strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Findings", value: findings.length, color: "#667eea" },
          { label: "Critical", value: criticalCount, color: "#EF4444" },
          { label: "Open", value: openCount, color: "#F59E0B" },
          { label: "Type", value: record.audit_type, color: "#10B981" },
        ].map((k) => (
          <Grid size={{ xs: 6, sm: 3 }} key={k.label}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${k.color}20` }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                <Typography variant="h5" fontWeight={800} color={k.color}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label={`Findings (${findings.length})`} />
        <Tab label="Workflow" />
        <Tab label="Actions" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Audit Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "Audit Number", value: record.audit_number },
                  { label: "Type", value: record.audit_type },
                  { label: "Auditee", value: (record as unknown as Record<string, unknown>).auditee_department as string },
                  { label: "Lead Auditor", value: record.lead_auditor },
                  { label: "Scheduled Date", value: (record as unknown as Record<string, unknown>).scheduled_date as string },
                  { label: "Created", value: new Date(record.created_at).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value || "—"}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Scope</Typography>
                <Typography variant="body2">{record.scope}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Workflow Progress</Typography>
                <WorkflowTimeline steps={buildSteps(record)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => setAddFindingOpen(true)}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
              Add Finding
            </Button>
          </Box>
          {findings.length === 0 ? (
            <Alert severity="info">No findings recorded for this audit yet.</Alert>
          ) : (
            <Card sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CAPA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {findings.map((f) => {
                    return (
                      <TableRow key={f.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{f.finding_number}</Typography>
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={f.severity} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{f.description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{(f as unknown as Record<string, unknown>).reference_clause as string || "—"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={f.status} size="small" sx={{ textTransform: "capitalize" }} />
                        </TableCell>
                        <TableCell>
                          {f.linked_capa ? (
                            <Chip label={`CAPA #${f.linked_capa}`} size="small"
                              icon={<AssignmentIcon sx={{ fontSize: 14 }} />}
                              sx={{ bgcolor: "#D1FAE5", color: "#065F46" }} />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Workflow History</Typography>
            <WorkflowTimeline steps={buildSteps(record)} />
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>AI-Extracted Action Items</Typography>
            {actionsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={24} /></Box>
            ) : (
              <ActionMatrix actions={actions} onChange={setActions} recordType="Audit" recordId={id} />
            )}
          </CardContent>
        </Card>
      )}

      <AddFindingDialog
        open={addFindingOpen}
        auditId={id!}
        onClose={() => setAddFindingOpen(false)}
        onAdded={load}
      />

      <ESignatureDialog
        open={esigOpen}
        title={`Close Audit ${record.audit_number}`}
        onConfirm={async (password) => {
          if (pendingAction) await doTransition(pendingAction, password);
        }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }}
      />

      <AuditTrailDrawer
        open={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        title={`Audit Trail — ${record.audit_number}`}
        entries={[]}
      />
    </Box>
  );
}
