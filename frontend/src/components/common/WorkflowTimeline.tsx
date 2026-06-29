import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export interface WorkflowStep {
  status: string;
  label: string;
  user?: string;
  timestamp?: string;
  reason?: string;
  completed: boolean;
  current: boolean;
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  orientation?: "horizontal" | "vertical";
}

export default function WorkflowTimeline({
  steps,
  orientation = "vertical",
}: WorkflowTimelineProps) {
  const activeStep = steps.findIndex((s) => s.current);

  return (
    <Box sx={{ py: 1 }}>
      <Stepper activeStep={activeStep} orientation={orientation} nonLinear>
        {steps.map((step) => (
          <Step key={step.status} completed={step.completed}>
            <StepLabel
              StepIconComponent={() =>
                step.completed ? (
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 22 }} />
                ) : step.current ? (
                  <RadioButtonUncheckedIcon sx={{ color: "#667eea", fontSize: 22 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: "#D1D5DB", fontSize: 22 }} />
                )
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={step.current ? 700 : 500}
                  color={step.current ? "#667eea" : step.completed ? "#10B981" : "#9CA3AF"}
                >
                  {step.label}
                </Typography>
                {step.current && (
                  <Chip
                    label="Current"
                    size="small"
                    sx={{
                      height: 18,
                      bgcolor: "#EEF2FF",
                      color: "#667eea",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </StepLabel>
            {orientation === "vertical" && (step.completed || step.current) && (
              <StepContent>
                <Box sx={{ pb: 1 }}>
                  {step.user && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      By: <strong>{step.user}</strong>
                    </Typography>
                  )}
                  {step.timestamp && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(step.timestamp).toLocaleString()}
                    </Typography>
                  )}
                  {step.reason && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{
                        mt: 0.5,
                        fontStyle: "italic",
                        borderLeft: "2px solid #E9ECEF",
                        pl: 1,
                      }}
                    >
                      "{step.reason}"
                    </Typography>
                  )}
                </Box>
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
