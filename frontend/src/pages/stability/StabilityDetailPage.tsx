import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert, Card, CardContent,
  IconButton, Stepper, Step, StepLabel, Divider, FormControlLabel, Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  stabilityService, type StabilityProtocol, type StabilityPullPoint,
} from "../../services/stability.service";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AIRemarkField from "../../components/common/AIRemarkField";

const STATUS_LABELS: Record<string, string> = { draft: "Draft", approved: "Approved", closed: "Closed" };
const NEXT_ACTIONS: Record<string, string[]> = { draft: ["approved"], approved: ["closed"], closed: [] };

const PULL_POINT_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircleIcon sx={{ color: "#10B981", fontSize: 22 }} />,
  pulled: <CheckCircleIcon sx={{ color: "#667eea", fontSize: 22 }} />,
  overdue: <WarningAmberIcon sx={{ color: "#EF4444", fontSize: 22 }} />,
  pending: <RadioButtonUncheckedIcon sx={{ color: "#D1D5DB", fontSize: 22 }} />,
};

export default function StabilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<StabilityProtocol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [advisoryDraft, setAdvisoryDraft] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await stabilityService.getById(id);
      setRecord(data);
      if (!selectedPointId && data.pull_points.length) setSelectedPointId(data.pull_points[0].id);
    } catch {
      setError("Failed to load stability protocol.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = (action: string) => {
    setPendingAction(action);
    setEsigOpen(true);
  };

  const doTransition = async (password: string) => {
    if (!id || !pendingAction) return;
    await stabilityService.transition(id, pendingAction, undefined, password);
    await load();
  };

  const updatePullPoint = async (pointId: string, data: Partial<StabilityPullPoint>) => {
    await stabilityService.updatePullPoint(pointId, data);
    await load();
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const available = NEXT_ACTIONS[record.status] || [];
  const selectedPoint = record.pull_points.find((p) => p.id === selectedPointId) || null;
  const activeIndex = record.pull_points.findIndex((p) => p.id === selectedPointId);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/stability")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{record.protocol_number}</Typography>
          <Typography variant="body2" color="text.secondary">
            {record.product} · {record.batch_lot} · {record.study_type_display} · {record.storage_condition}
          </Typography>
        </Box>
        <Chip label={STATUS_LABELS[record.status]} sx={{ fontWeight: 700 }} />
        {available.map((action) => (
          <Button key={action} variant="contained" onClick={() => handleTransition(action)}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Pull Point Timeline</Typography>
          <Stepper activeStep={activeIndex} alternativeLabel nonLinear>
            {record.pull_points.map((p) => (
              <Step key={p.id} completed={p.status === "completed"}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box onClick={() => setSelectedPointId(p.id)} sx={{ cursor: "pointer" }}>
                      {PULL_POINT_ICON[p.status] || PULL_POINT_ICON.pending}
                    </Box>
                  )}
                >
                  <Box onClick={() => setSelectedPointId(p.id)} sx={{ cursor: "pointer" }}>
                    <Typography variant="body2" fontWeight={p.id === selectedPointId ? 700 : 500}>{p.time_point}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.scheduled_date}</Typography>
                    {p.oot_flag && <Chip label="OOT" size="small" sx={{ ml: 0.5, height: 16, bgcolor: "#FEE2E2", color: "#991B1B" }} />}
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {selectedPoint && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Pull Point — {selectedPoint.time_point}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Scheduled Date</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedPoint.scheduled_date}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Actual Date</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedPoint.actual_date || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedPoint.status_display}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {selectedPoint.status === "pending" && (
                <Button size="small" variant="outlined"
                  onClick={() => updatePullPoint(selectedPoint.id, { status: "pulled", actual_date: new Date().toISOString().slice(0, 10) })}>
                  Mark Pulled
                </Button>
              )}
              {selectedPoint.status === "pulled" && (
                <Button size="small" variant="contained" sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
                  onClick={() => updatePullPoint(selectedPoint.id, { status: "completed" })}>
                  Mark Completed
                </Button>
              )}
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPoint.oot_flag}
                  onChange={(e) => {
                    setAdvisoryDraft(selectedPoint.ai_remark_draft || "");
                    updatePullPoint(selectedPoint.id, { oot_flag: e.target.checked });
                  }}
                />
              }
              label="Flag as Out-of-Trend (OOT) result"
            />

            {selectedPoint.oot_flag && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: "1px solid #FEE2E2" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Advisory: OOT result — AI-drafted remark
                </Typography>
                <AIRemarkField
                  module="stability"
                  recordId={selectedPoint.id}
                  approverRole="qc_analyst"
                  stage="oot_detected"
                  value={advisoryDraft || selectedPoint.ai_remark_draft}
                  onRemarkChange={setAdvisoryDraft}
                  onConfirmChange={() => { /* no-op — Save Draft button handles persistence */ }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
                    onClick={() => updatePullPoint(selectedPoint.id, { ai_remark_draft: advisoryDraft })}
                  >
                    Save Draft
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <ESignatureDialog
        open={esigOpen}
        title={`${pendingAction === "closed" ? "Close" : "Approve"} Stability Protocol`}
        meaning={`I ${pendingAction === "closed" ? "confirm closure of" : "approve"} stability protocol ${record.protocol_number}.`}
        onConfirm={async (password) => { await doTransition(password); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }}
      />
    </Box>
  );
}
