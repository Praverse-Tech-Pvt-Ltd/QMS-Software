import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Tabs, Tab, Grid, Divider, IconButton, Tooltip,
  Stepper, Step, StepLabel, StepContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { oosService, type OOSRecord } from "../../services/oos.service";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AuditTrailDrawer from "../../components/common/AuditTrailDrawer";

const PHASE_STEPS = [
  { key: "phase1", label: "Phase I — Lab Investigation", desc: "Instrument check, sample prep, calculation review" },
  { key: "phase2", label: "Phase II — Full Investigation", desc: "Expanded investigation, manufacturing review, additional testing" },
  { key: "conclusion", label: "Conclusion", desc: "Confirmed OOS or Invalidated with assignable cause" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  phase1: { bg: "#EEF2FF", color: "#667eea" },
  phase2: { bg: "#FEF3C7", color: "#92400E" },
  invalidated: { bg: "#D1FAE5", color: "#065F46" },
  confirmed_oos: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function OOSDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<OOSRecord | null>(null);
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
    try { setRecord(await oosService.getById(id)); }
    catch { setError("Failed to load OOS investigation."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = (action: string) => {
    if (["invalidated", "confirmed_oos"].includes(action)) {
      setPendingAction(action); setEsigOpen(true);
    } else { doTransition(action); }
  };

  const doTransition = async (action: string, esigPassword?: string) => {
    if (!id) return;
    setTransitioning(true);
    try { await oosService.transition(id, action, esigPassword ? { esig_password: esigPassword } : undefined); await load(); }
    catch (e: unknown) { setError((e as Error).message || "Transition failed."); }
    finally { setTransitioning(false); setEsigOpen(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const phase = record.phase || "phase1";
  const phaseStyle = STATUS_COLORS[phase] || { bg: "#F3F4F6", color: "#374151" };
  const activeStep = PHASE_STEPS.findIndex((s) => s.key === phase);
  const isPhase1 = phase === "phase1";

  const nextActions: Record<string, { label: string; action: string }[]> = {
    phase1: [
      { label: "Proceed to Phase II", action: "phase2" },
      { label: "Invalidate (Assignable Cause Found)", action: "invalidated" },
    ],
    phase2: [
      { label: "Confirm OOS", action: "confirmed_oos" },
      { label: "Invalidate", action: "invalidated" },
    ],
  };
  const available = nextActions[phase] || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/oos")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{record.oos_number}</Typography>
          <Typography variant="body2" color="text.secondary">
            {record.test_name} — Result: {record.result_obtained} (Spec: {record.specification})
          </Typography>
        </Box>
        <Chip label={phase.replace("phase", "Phase ")} sx={{ bgcolor: phaseStyle.bg, color: phaseStyle.color, fontWeight: 700 }} />
        <Tooltip title="Audit Trail"><IconButton onClick={() => setDrawerOpen(true)}><HistoryIcon /></IconButton></Tooltip>
        {available.map((a) => (
          <Button key={a.action} variant={a.action.includes("invalidat") || a.action === "confirmed_oos" ? "contained" : "outlined"}
            onClick={() => handleTransition(a.action)} disabled={transitioning}
            sx={a.action === "confirmed_oos" ? { bgcolor: "#EF4444", "&:hover": { bgcolor: "#DC2626" } }
              : a.action === "phase2" ? { bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } } : {}}>
            {a.label}
          </Button>
        ))}
      </Box>

      {/* Phase stepper */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Investigation Phase</Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {PHASE_STEPS.map((step, i) => (
              <Step key={step.key} completed={i < activeStep}>
                <StepLabel
                  StepIconComponent={() =>
                    i < activeStep ? (
                      <CheckCircleIcon sx={{ color: "#10B981", fontSize: 22 }} />
                    ) : i === activeStep ? (
                      <RadioButtonUncheckedIcon sx={{ color: "#667eea", fontSize: 22 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: "#D1D5DB", fontSize: 22 }} />
                    )
                  }
                >
                  <Typography variant="body2" fontWeight={i === activeStep ? 700 : 500}
                    color={i === activeStep ? "#667eea" : i < activeStep ? "#10B981" : "#9CA3AF"}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="caption" color="text.secondary">{step.desc}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="Summary" />
        {isPhase1 && <Tab label="Phase I Checklist" />}
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>OOS Details</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: "OOS Number", value: record.oos_number },
                  { label: "Test Name", value: record.test_name },
                  { label: "Result Obtained", value: `${record.result_obtained} ${record.unit || ""}` },
                  { label: "Specification", value: record.specification },
                  { label: "Sample ID", value: record.sample_id },
                  { label: "Phase", value: phase },
                  { label: "Created", value: new Date(record.created_at).toLocaleDateString() },
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
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Key Facts</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Chip label={`Current Phase: ${phase}`} sx={{ bgcolor: phaseStyle.bg, color: phaseStyle.color }} />
                  {record.lab_error_confirmed && <Chip label="Lab Error Confirmed" sx={{ bgcolor: "#D1FAE5", color: "#065F46" }} />}
                  {record.phase2_initiated && <Chip label="Phase II Initiated" sx={{ bgcolor: "#FEF3C7", color: "#92400E" }} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Phase I — Laboratory Investigation Checklist</Typography>
            {[
              { label: "Instrument calibration verified?", value: record.phase1_conclusion ? "Yes" : "Pending" },
              { label: "Sample preparation reviewed?", value: "Pending" },
              { label: "Calculation errors checked?", value: "Pending" },
              { label: "Analyst retest conducted?", value: record.phase1_conclusion ? "Yes" : "Pending" },
              { label: "Phase I Conclusion", value: record.phase1_conclusion || "Not yet concluded" },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 250, flexShrink: 0 }}>{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{value}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <ESignatureDialog open={esigOpen}
        title={pendingAction === "confirmed_oos" ? "Confirm OOS Result" : "Invalidate OOS (Assignable Cause)"}
        onConfirm={async (pw) => { if (pendingAction) await doTransition(pendingAction, pw); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }} />
      <AuditTrailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`Audit Trail — ${record.oos_number}`} entries={[]} />
    </Box>
  );
}
