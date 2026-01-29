import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { useMemo, useState } from "react";

// ✅ 1. Define Props Interface
interface ImpactAssessmentPanelProps {
  readOnly?: boolean;
}

type PlanRow = {
  step: string;
  owner: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Done";
};

export default function ImpactAssessmentPanel({ readOnly = false }: ImpactAssessmentPanelProps) {
  const [impact, setImpact] = useState({
    validation: true,
    regulatory: false,
    stability: false,
    documents: true,
    training: true,
    supplier: false,
  });

  const [riskLevel, setRiskLevel] = useState("Medium");
  const [riskNotes, setRiskNotes] = useState("");
  const [mitigation, setMitigation] = useState("");

  // Mock Plan Data
  const [planRows] = useState<PlanRow[]>([
    {
      step: "Update SOP and controlled documents",
      owner: "QA Lead",
      dueDate: "2026-01-25",
      status: "In Progress",
    },
    {
      step: "Conduct training for impacted employees",
      owner: "Training Coordinator",
      dueDate: "2026-01-28",
      status: "Pending",
    },
    {
      step: "Perform validation verification",
      owner: "Validation Team",
      dueDate: "2026-02-02",
      status: "Pending",
    },
  ]);

  const impactCount = useMemo(() => {
    return Object.values(impact).filter(Boolean).length;
  }, [impact]);

  const impactBadgeColor =
    impactCount >= 4 ? "error" : impactCount >= 2 ? "warning" : "success";

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: readOnly ? "#fafafa" : "white" // Subtle visual cue
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Impact Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Evaluate functional and compliance impact before implementation.
          </Typography>
        </Box>

        <Chip
          label={`Impact Areas: ${impactCount}`}
          color={impactBadgeColor as any}
          variant="outlined"
        />
      </Box>

      {/* ✅ 2. Read-Only Checkboxes */}
      <Box sx={{ mt: 2, display: "grid", gap: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={impact.validation}
              onChange={(e) =>
                setImpact((p) => ({ ...p, validation: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Validation Impact"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={impact.regulatory}
              onChange={(e) =>
                setImpact((p) => ({ ...p, regulatory: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Regulatory Impact"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={impact.stability}
              onChange={(e) =>
                setImpact((p) => ({ ...p, stability: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Stability Impact"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={impact.documents}
              onChange={(e) =>
                setImpact((p) => ({ ...p, documents: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Document / SOP Updates"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={impact.training}
              onChange={(e) =>
                setImpact((p) => ({ ...p, training: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Training Impact"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={impact.supplier}
              onChange={(e) =>
                setImpact((p) => ({ ...p, supplier: e.target.checked }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Supplier / Vendor Impact"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
        Risk Assessment
      </Typography>

      {/* ✅ 3. Read-Only Inputs */}
      <Box sx={{ display: "grid", gap: 2 }}>
        <TextField
          select
          label="Overall Risk Level"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
          disabled={readOnly} // Locked
          fullWidth
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
        </TextField>

        <TextField
          label="Risk Notes"
          value={riskNotes}
          onChange={(e) => setRiskNotes(e.target.value)}
          multiline
          rows={3}
          placeholder="Describe risk and potential quality impact..."
          disabled={readOnly} // Locked
          fullWidth
        />

        <TextField
          label="Mitigation / Control Plan"
          value={mitigation}
          onChange={(e) => setMitigation(e.target.value)}
          multiline
          rows={3}
          placeholder="Describe mitigation steps..."
          disabled={readOnly} // Locked
          fullWidth
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
        Implementation Plan
      </Typography>

      {!readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
           You can add new implementation steps in Edit mode.
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 1.5 }}>
        {planRows.map((row, idx) => (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.02)",
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Step: {row.step}
            </Typography>

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Owner: {row.owner} • Due: {row.dueDate} • Status: {row.status}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}