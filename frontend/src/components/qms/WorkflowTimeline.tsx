import { Box, Paper, Step, StepLabel, Stepper, Typography, Chip }from "@mui/material";
import type { WorkflowStatus, WorkflowStep } from "../../services/workflow.service";

interface WorkflowTimelineProps {
  currentStatus: WorkflowStatus;
  steps: WorkflowStep[];
}

export default function WorkflowTimeline({ currentStatus, steps }: WorkflowTimelineProps) {
  let activeStep = steps.findIndex((s) => s.status === currentStatus);

  if (activeStep === -1) {
    if (currentStatus === "CLOSED" || currentStatus === "EFFECTIVE") activeStep = steps.length;
    if (currentStatus === "REJECTED") activeStep = steps.findIndex(s => s.status === "REVIEW") || 0;
  }

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", background: "linear-gradient(to bottom, #ffffff, #fafafa)" }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Status Timeline</Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, idx) => (
          <Step key={step.id} completed={idx < activeStep}>
            <StepLabel error={currentStatus === "REJECTED" && idx === activeStep}>
              <Typography variant={idx === activeStep ? "subtitle2" : "body2"} fontWeight={idx === activeStep ? 700 : 400}>
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #eee' }}>
        <Typography variant="caption" color="text.secondary">
          Current State: <Chip label={currentStatus} size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
        </Typography>
      </Box>
    </Paper>
  );
}