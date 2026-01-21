import { Box, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import type { ModuleKey, WorkflowStatus } from "../../config/workflows";
import { workflows } from "../../config/workflows";

export default function WorkflowTimeline({
  moduleKey,
  currentStatus,
}: {
  moduleKey: ModuleKey;
  currentStatus: WorkflowStatus;
}) {
  const wf = workflows[moduleKey];
  const steps = wf.steps;

  const activeStep = Math.max(0, steps.indexOf(currentStatus));

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
        Status Timeline
      </Typography>

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {wf.label}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, idx) => (
            <Step key={label} completed={idx < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Audit Trail and e-Signature placeholder
        </Typography>
      </Box>
    </Paper>
  );
}
