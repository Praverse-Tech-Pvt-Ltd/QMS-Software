import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import { suppliersService, type SupplierRecord, type Scorecard } from "../../services/suppliers.service";
import WorkflowTimeline, { type WorkflowStep } from "../../components/common/WorkflowTimeline";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";

const STATUS_ORDER = ["pending", "qualified", "conditional", "suspended", "disqualified"];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  qualified: { bg: "#D1FAE5", color: "#065F46" },
  conditional: { bg: "#EEF2FF", color: "#667eea" },
  suspended: { bg: "#FFEDD5", color: "#9A3412" },
  disqualified: { bg: "#FEE2E2", color: "#991B1B" },
};
const EXPIRY_COLORS: Record<string, { bg: string; color: string }> = {
  valid: { bg: "#D1FAE5", color: "#065F46" },
  expiring_soon: { bg: "#FEF3C7", color: "#92400E" },
  expired: { bg: "#FEE2E2", color: "#991B1B" },
  not_qualified: { bg: "#F3F4F6", color: "#374151" },
};

function buildSteps(record: SupplierRecord): WorkflowStep[] {
  const currentIdx = STATUS_ORDER.indexOf(record.status);
  return STATUS_ORDER.map((s, i) => ({
    status: s, label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    completed: i < currentIdx, current: i === currentIdx,
  }));
}

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SupplierRecord | null>(null);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
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
    try {
      const [rec, cards] = await Promise.all([
        suppliersService.getById(id),
        Promise.resolve<Scorecard[]>([]),
      ]);
      setRecord(rec);
      setScorecards(cards);
    } catch { setError("Failed to load supplier."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = (action: string) => {
    if (["qualified", "disqualified"].includes(action)) { setPendingAction(action); setEsigOpen(true); }
    else doTransition(action);
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id) return;
    setTransitioning(true);
    try { await suppliersService.transition(id, action, undefined, esigPassword); await load(); }
    catch (e: unknown) { setError((e as Error).message || "Transition failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const statusStyle = STATUS_COLORS[record.status] || { bg: "#F3F4F6", color: "#374151" };
  const expiryStyle = EXPIRY_COLORS[record.expiry_status || "not_qualified"];
  const nextActions: Record<string, string[]> = {
    pending: ["qualified", "disqualified"],
    qualified: ["conditional", "suspended", "disqualified"],
    conditional: ["qualified", "disqualified"],
    suspended: ["qualified", "disqualified"],
  };
  const available = nextActions[record.status] || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/suppliers")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{record.supplier_code} — {record.name}</Typography>
          <Typography variant="body2" color="text.secondary">{record.category} · {record.country}</Typography>
        </Box>
        <Chip label={record.status} sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700, textTransform: "capitalize" }} />
        {record.expiry_status && (
          <Chip label={record.expiry_status.replace(/_/g, " ")} size="small"
            sx={{ bgcolor: expiryStyle.bg, color: expiryStyle.color, textTransform: "capitalize" }} />
        )}
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {available.map((action) => (
          <Button key={action} variant={action === "qualified" ? "contained" : "outlined"}
            onClick={() => handleTransition(action)} disabled={transitioning}
            sx={action === "qualified" ? { bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }
              : action === "disqualified" ? { color: "#EF4444", borderColor: "#EF4444" } : {}}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        <Tab label={`Scorecards (${scorecards.length})`} />
        <Tab label="Workflow" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Supplier Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "Supplier Code", value: record.supplier_code },
                  { label: "Name", value: record.name },
                  { label: "Category", value: record.category },
                  { label: "Country", value: record.country },
                  { label: "Contact Name", value: record.contact_name },
                  { label: "Contact Email", value: record.contact_email },
                  { label: "Qualification Date", value: (record as unknown as Record<string, unknown>).qualification_date as string },
                  { label: "Expiry Date", value: (record as unknown as Record<string, unknown>).expiry_date as string },
                  { label: "Days to Expiry", value: record.days_to_expiry !== undefined ? `${record.days_to_expiry} days` : undefined },
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
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Qualification Status</Typography>
                <WorkflowTimeline steps={buildSteps(record)} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          {scorecards.length === 0 ? (
            <CardContent><Alert severity="info">No scorecards recorded yet.</Alert></CardContent>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quality</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Delivery</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Overall</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scorecards.map((sc) => (
                  <TableRow key={sc.id} hover>
                    <TableCell>{sc.period}</TableCell>
                    {[sc.quality_score, sc.delivery_score, sc.service_score, sc.overall_score].map((score, i) => (
                      <TableCell key={i}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress variant="determinate" value={score}
                            sx={{ width: 60, height: 6, borderRadius: 3,
                              "& .MuiLinearProgress-bar": { bgcolor: score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444" } }} />
                          <Typography variant="caption">{score}%</Typography>
                        </Box>
                      </TableCell>
                    ))}
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

      <ESignatureDialog open={esigOpen}
        title={`${pendingAction === "qualified" ? "Qualify" : "Disqualify"} Supplier ${record.supplier_code}`}
        onConfirm={async (pw) => { if (pendingAction) await doTransition(pendingAction, pw); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${record.supplier_code}`} entries={[]} />
    </Box>
  );
}
