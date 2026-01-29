import { Box, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import type { WorkflowStatus, WorkflowStep } from "../../types/workflow.types";

// ✅ 1. Update Props to accept dynamic 'steps'
interface WorkflowTimelineProps {
  currentStatus: WorkflowStatus;
  steps: WorkflowStep[]; // Now required
}

export default function WorkflowTimeline({
  currentStatus,
  steps,
}: WorkflowTimelineProps) {
  
  // ✅ 2. Dynamic Active Step Calculation
  // Find the index of the step that matches the current status
  let activeStep = steps.findIndex((s) => s.status === currentStatus);

  // Fallback: If status is "Closed" or "Rejected" (and not explicitly a step), handle gracefully
  if (activeStep === -1) {
    if (currentStatus === "Closed") activeStep = steps.length; // All done
    if (currentStatus === "Rejected") activeStep = 0; // Back to start (or handle specific logic)
  }

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        // Optional: Add a subtle background to distinguish the timeline
        background: "linear-gradient(to bottom, #ffffff, #fafafa)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Status Timeline
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, idx) => (
          <Step key={step.id} completed={idx < activeStep}>
            <StepLabel 
              // Optional: Highlight the current step label
              error={currentStatus === "Rejected" && idx === activeStep}
            >
              <Typography 
                variant={idx === activeStep ? "subtitle2" : "body2"}
                fontWeight={idx === activeStep ? 700 : 400}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #eee' }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Current State: <strong>{currentStatus}</strong>
        </Typography>
      </Box>
    </Paper>
  );
}