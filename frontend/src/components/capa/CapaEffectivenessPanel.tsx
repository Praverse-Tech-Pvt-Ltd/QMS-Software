import {
  Box,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert
} from "@mui/material";
import { useState } from "react";

// ✅ 1. Define Props Interface
interface CapaEffectivenessPanelProps {
  readOnly?: boolean;
}

export default function CapaEffectivenessPanel({ readOnly = false }: CapaEffectivenessPanelProps) {
  const [result, setResult] = useState("Pending");
  const [method, setMethod] = useState("Trend Review");
  const [reviewDate, setReviewDate] = useState("");
  const [reviewer, setReviewer] = useState("QA Manager");
  const [evidence, setEvidence] = useState("");

  const [closureChecks, setClosureChecks] = useState({
    actionsImplemented: true,
    trainingCompleted: false,
    documentsUpdated: false,
    effectivenessVerified: false,
    qaApproved: false,
  });

  const statusColor =
    result === "Effective"
      ? "success"
      : result === "Not Effective"
      ? "error"
      : "warning";

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: readOnly ? "#fafafa" : "white" // Visual cue
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Effectiveness Check
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Verify whether CAPA actions prevented recurrence.
          </Typography>
        </Box>

        <Chip
          label={`Result: ${result}`}
          color={statusColor as any}
          variant="outlined"
        />
      </Box>

      {/* Helper Alert */}
      {!readOnly && (
        <Alert severity="info" sx={{ my: 2 }}>
           Complete the effectiveness verification below.
        </Alert>
      )}

      {/* ✅ 2. Read-Only Inputs */}
      <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
        <TextField
          select
          label="Result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          disabled={readOnly} // Locked
          fullWidth
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Effective">Effective</MenuItem>
          <MenuItem value="Not Effective">Not Effective</MenuItem>
        </TextField>

        <TextField
          select
          label="Verification Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          disabled={readOnly} // Locked
          fullWidth
        >
          <MenuItem value="Trend Review">Trend Review</MenuItem>
          <MenuItem value="Batch Review">Batch Review</MenuItem>
          <MenuItem value="Internal Audit">Internal Audit</MenuItem>
          <MenuItem value="Customer Feedback">Customer Feedback</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Review Date"
          InputLabelProps={{ shrink: true }}
          value={reviewDate}
          onChange={(e) => setReviewDate(e.target.value)}
          disabled={readOnly} // Locked
          fullWidth
        />

        <TextField
          select
          label="Reviewed By"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          disabled={readOnly} // Locked
          fullWidth
        >
          <MenuItem value="QA Manager">QA Manager</MenuItem>
          <MenuItem value="QA Lead">QA Lead</MenuItem>
          <MenuItem value="Compliance Officer">Compliance Officer</MenuItem>
        </TextField>

        <TextField
          label="Evidence / Notes"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          multiline
          rows={3}
          placeholder="Attach evidence in Attachments tab."
          disabled={readOnly} // Locked
          fullWidth
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
        Closure Checklist
      </Typography>

      {/* ✅ 3. Read-Only Checkboxes */}
      <Box sx={{ display: "grid", gap: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={closureChecks.actionsImplemented}
              onChange={(e) =>
                setClosureChecks((p) => ({
                  ...p,
                  actionsImplemented: e.target.checked,
                }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Corrective/Preventive actions implemented"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={closureChecks.trainingCompleted}
              onChange={(e) =>
                setClosureChecks((p) => ({
                  ...p,
                  trainingCompleted: e.target.checked,
                }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Training completed for relevant employees"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={closureChecks.documentsUpdated}
              onChange={(e) =>
                setClosureChecks((p) => ({
                  ...p,
                  documentsUpdated: e.target.checked,
                }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="SOP / controlled documents updated"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={closureChecks.effectivenessVerified}
              onChange={(e) =>
                setClosureChecks((p) => ({
                  ...p,
                  effectivenessVerified: e.target.checked,
                }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="Effectiveness verified and documented"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={closureChecks.qaApproved}
              onChange={(e) =>
                setClosureChecks((p) => ({
                  ...p,
                  qaApproved: e.target.checked,
                }))
              }
              disabled={readOnly} // Locked
            />
          }
          label="QA approval for closure completed"
        />
      </Box>
    </Paper>
  );
}