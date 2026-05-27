import { Box, Paper, Step, StepLabel, Stepper, Typography, Chip, Stack } from "@mui/material";
import type { WorkflowStatus, WorkflowStep } from "../../services/workflow.service";

interface WorkflowTimelineProps {
  currentStatus: WorkflowStatus | string;
  steps: WorkflowStep[];
}

export default function WorkflowTimeline({ currentStatus, steps }: WorkflowTimelineProps) {
  // ✅ Defense: Ensure comparison is case-insensitive
  const normalizedStatus = String(currentStatus).toUpperCase();
  
  let activeStep = steps.findIndex((s) => s.status.toUpperCase() === normalizedStatus);

  if (activeStep === -1) {
    if (normalizedStatus === "CLOSED" || normalizedStatus === "EFFECTIVE") {
        activeStep = steps.length;
    } else if (normalizedStatus === "REJECTED") {
        // Find where it was likely rejected from (Review/Evaluation)
        activeStep = steps.findIndex(s => ["REVIEW", "EVALUATION", "QA_REVIEW"].includes(s.status)) || 0;
    } else {
        activeStep = 0; // Fallback to start
    }
  }

  return (
    <Paper sx={{ 
        p: 2.5, 
        borderRadius: 3, 
        border: "1px solid #e2e8f0", 
        background: "linear-gradient(to bottom, #ffffff, #fafafa)",
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
        Workflow Progress
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical" connector={<Box sx={{ ml: 1.5, borderLeft: '1px solid #e2e8f0', height: 20 }} />}>
        {steps.map((step, idx) => {
          const isCurrent = idx === activeStep;
          const isCompleted = idx < activeStep;
          
          return (
            <Step key={step.id} completed={isCompleted}>
              <StepLabel 
                error={normalizedStatus === "REJECTED" && isCurrent}
                StepIconProps={{
                    sx: { 
                        '&.Mui-active': { color: '#4f46e5' },
                        '&.Mui-completed': { color: '#10b981' }
                    }
                }}
              >
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: isCurrent ? 800 : 500,
                        color: isCurrent ? '#0f172a' : isCompleted ? '#64748b' : '#94a3b8'
                    }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
              CURRENT STATUS:
            </Typography>
            <Chip 
                label={normalizedStatus} 
                size="small" 
                color={normalizedStatus === "REJECTED" ? "error" : "primary"}
                sx={{ fontWeight: 900, height: 20, fontSize: '0.6rem', borderRadius: 1 }} 
            />
        </Stack>
      </Box>
    </Paper>
  );
}