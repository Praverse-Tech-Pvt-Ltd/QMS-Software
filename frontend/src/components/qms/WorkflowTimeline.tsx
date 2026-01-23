import { Box, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import type { WorkflowStatus } from "../../types/workflow.types";

const steps: WorkflowStatus[] = ["Draft", "QA Review", "Approved", "Effective", "Closed"];

export default function WorkflowTimeline({
  currentStatus,
}: {
  currentStatus: WorkflowStatus;
}) {
  const activeStep = Math.max(0, steps.indexOf(currentStatus));

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Status Timeline
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, idx) => (
          <Step key={label} completed={idx < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Audit Trail and e-Signature placeholder
        </Typography>
      </Box>
    </Paper>
  );
}
