import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Skeleton,
  Chip,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { aiService } from "../../services/ai.service";

interface AIRemarkFieldProps {
  module: string;
  recordId: string;
  approverRole: string;
  stage: string;
  riskLevel?: string;
  onRemarkChange: (remark: string) => void;
  onConfirmChange: (confirmed: boolean) => void;
  value?: string;
}

export default function AIRemarkField({
  module,
  recordId,
  approverRole,
  stage,
  riskLevel = "Medium",
  onRemarkChange,
  onConfirmChange,
  value = "",
}: AIRemarkFieldProps) {
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState(value);
  const [citations, setCitations] = useState<string[]>([]);
  const [riskFlags, setRiskFlags] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  const fetchRemark = async () => {
    setLoading(true);
    setAiLoaded(false);
    setConfirmed(false);
    try {
      const data = await aiService.generateRemark({
        module,
        record_id: recordId,
        approver_role: approverRole,
        stage,
        risk_level: riskLevel,
      });
      const newRemark = data.remark_draft || "";
      setRemark(newRemark);
      setCitations(data.sop_citations || []);
      setRiskFlags(data.risk_flags || []);
      onRemarkChange(newRemark);
      setAiLoaded(true);
    } catch {
      // AI never blocks — silently fail, user can type the remark manually.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module && recordId) {
      fetchRemark();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, recordId, stage]);

  const handleRemarkChange = (newValue: string) => {
    setRemark(newValue);
    onRemarkChange(newValue);
  };

  const handleConfirmChange = (checked: boolean) => {
    setConfirmed(checked);
    onConfirmChange(checked);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#667eea", fontSize: 18 }} />
          <Typography variant="body2" fontWeight={600} color="#667eea">
            AI-Drafted Remark
          </Typography>
          {aiLoaded && (
            <Chip label="AI Generated" size="small" sx={{ height: 18, bgcolor: "#EEF2FF", color: "#667eea", fontSize: "0.65rem" }} />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchRemark}
          disabled={loading}
          sx={{ color: "#667eea", fontSize: "0.75rem" }}
        >
          Regenerate
        </Button>
      </Box>

      {loading ? (
        <Box>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="95%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
      ) : (
        <TextField
          multiline
          minRows={4}
          maxRows={10}
          fullWidth
          value={remark}
          onChange={(e) => handleRemarkChange(e.target.value)}
          placeholder="Your review remark will appear here. Edit as needed."
          sx={{
            bgcolor: aiLoaded ? "#F5F3FF" : undefined,
            "& .MuiOutlinedInput-root": {
              fontFamily: "inherit",
              fontSize: "0.875rem",
            },
          }}
        />
      )}

      {citations.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          <InfoOutlinedIcon sx={{ color: "#9CA3AF", fontSize: 14, mt: 0.3 }} />
          {citations.map((c, i) => (
            <Chip
              key={i}
              label={c}
              size="small"
              sx={{ height: 20, bgcolor: "#F0FDF4", color: "#065F46", fontSize: "0.65rem", border: "1px solid #6EE7B7" }}
            />
          ))}
        </Box>
      )}

      {riskFlags.length > 0 && (
        <Alert severity="warning" sx={{ mt: 1, py: 0.5, borderRadius: 2 }}>
          {riskFlags.map((flag, i) => (
            <Typography key={i} variant="caption" display="block">
              {flag}
            </Typography>
          ))}
        </Alert>
      )}

      <FormControlLabel
        sx={{ mt: 1.5 }}
        control={
          <Checkbox
            checked={confirmed}
            onChange={(e) => handleConfirmChange(e.target.checked)}
            size="small"
            sx={{ color: "#667eea", "&.Mui-checked": { color: "#667eea" } }}
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            I have reviewed this remark and confirm it accurately reflects my assessment.
          </Typography>
        }
      />
    </Box>
  );
}
