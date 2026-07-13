import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert, Card, CardContent,
  IconButton, Divider, Switch, FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { recallService, type RecallRecord } from "../../services/recall.service";
import ESignatureDialog from "../../components/common/ESignatureDialog";

const CLASS_COLORS: Record<string, { bg: string; color: string }> = {
  I: { bg: "#FEE2E2", color: "#991B1B" },
  II: { bg: "#FEF3C7", color: "#92400E" },
  III: { bg: "#F3F4F6", color: "#374151" },
};

const NEXT_ACTIONS: Record<string, string[]> = {
  initiated: ["active"],
  active: ["completed", "closed"],
  completed: ["closed"],
  closed: [],
};

export default function RecallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<RecallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try { setRecord(await recallService.getById(id)); }
    catch { setError("Failed to load recall record."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const ESIG_REQUIRED_ACTIONS = ["active", "closed"];

  const handleTransition = (action: string) => {
    if (ESIG_REQUIRED_ACTIONS.includes(action)) {
      setPendingAction(action);
      setEsigOpen(true);
    } else {
      doTransition(action);
    }
  };

  const doTransition = async (action: string, password?: string) => {
    if (!id) return;
    await recallService.transition(id, action, undefined, password);
    await load();
  };

  const toggleRegulatoryNotified = async (checked: boolean) => {
    if (!id) return;
    await recallService.update(id, {
      regulatory_notified: checked,
      notification_date: checked ? new Date().toISOString().slice(0, 10) : null,
    });
    await load();
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  const classColor = CLASS_COLORS[record.recall_class] || CLASS_COLORS.III;
  const available = NEXT_ACTIONS[record.status] || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/recall")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{record.recall_number}</Typography>
          <Typography variant="body2" color="text.secondary">{record.product}</Typography>
        </Box>
        <Chip label={`Class ${record.recall_class}`} sx={{ bgcolor: classColor.bg, color: classColor.color, fontWeight: 700 }} />
        <Chip label={record.status_display} sx={{ fontWeight: 700 }} />
        {available.map((action) => (
          <Button key={action} variant="contained" onClick={() => handleTransition(action)}
            sx={action === "closed" || action === "active"
              ? { bgcolor: "#EF4444", "&:hover": { bgcolor: "#DC2626" } }
              : { bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </Box>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recall Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>Reason</Typography>
            <Typography variant="body2">{record.reason}</Typography>
          </Box>
          <Box sx={{ display: "flex", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>Batch / Lot Numbers</Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {record.batch_lots.length === 0 ? <Typography variant="body2">—</Typography> :
                record.batch_lots.map((b) => <Chip key={b} label={b} size="small" />)}
            </Box>
          </Box>
          <Box sx={{ display: "flex", mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>Linked Records</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {record.linked_complaint_number && (
                <Chip label={`Complaint: ${record.linked_complaint_number}`} size="small"
                  onClick={() => navigate(`/complaints/${record.linked_complaint}`)}
                  sx={{ bgcolor: "#EEF2FF", color: "#667eea", cursor: "pointer" }} />
              )}
              {record.linked_nc_number && (
                <Chip label={`NC: ${record.linked_nc_number}`} size="small"
                  onClick={() => navigate(`/nonconformance/${record.linked_nc}`)}
                  sx={{ bgcolor: "#EEF2FF", color: "#667eea", cursor: "pointer" }} />
              )}
              {!record.linked_complaint_number && !record.linked_nc_number && (
                <Typography variant="body2" color="text.secondary">None</Typography>
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={<Switch checked={record.regulatory_notified} onChange={(e) => toggleRegulatoryNotified(e.target.checked)} />}
            label="Regulatory authority notified"
          />
          {record.notification_date && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", ml: 6 }}>
              Notified on {record.notification_date}
            </Typography>
          )}
        </CardContent>
      </Card>

      <ESignatureDialog
        open={esigOpen}
        title={`${pendingAction === "closed" ? "Close" : pendingAction === "active" ? "Activate" : "Complete"} Recall`}
        meaning={`I confirm this recall action (${pendingAction}) for ${record.recall_number}.`}
        onConfirm={async (password) => { if (pendingAction) await doTransition(pendingAction, password); }}
        onClose={() => { setEsigOpen(false); setPendingAction(null); }}
      />
    </Box>
  );
}
