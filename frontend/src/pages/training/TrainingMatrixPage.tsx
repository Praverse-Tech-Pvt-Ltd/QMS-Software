import { Box, Button, Stack, alpha } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import TrainingMatrixBuilder from "../../components/training/TrainingMatrixBuilder";
import RetrainingImpactModal from "../../components/training/RetrainingImpactModal";
import { useState } from "react";
import UpdateIcon from "@mui/icons-material/Update";
import {
  trainingService,
  type TrainingPlan,
} from "../../services/training.service";
import { useSnackbar } from "notistack";

export default function TrainingMatrixPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [impactOpen, setImpactOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

  // ✅ Used to trigger the modal with a specific plan's context
  const handleSimulateUpdate = (plan: TrainingPlan) => {
    setSelectedPlan(plan);
    setImpactOpen(true);
  };

  const handleInitiateRetraining = async (reason: string) => {
    if (!selectedPlan) return;
    try {
      await trainingService.initiateRetraining(selectedPlan.id, reason);
      enqueueSnackbar(
        `Retraining workflow initiated for ${selectedPlan.title}`,
        { variant: "success" },
      );
      setImpactOpen(false);
    } catch (err) {
      enqueueSnackbar("Failed to initiate retraining", { variant: "error" });
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <PageHeader
          title="Training Matrix Management"
          subtitle="Define Role-Based Training Requirements"
          showBack
        />

        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<UpdateIcon />}
            // ✅ Now using the function with a default or selected plan
            onClick={() => setImpactOpen(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: alpha("#ed6c02", 0.05),
            }}
          >
            Retraining Impact Analysis
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mt: 3 }}>
        {/* ✅ Pass the selection handler to the builder */}
        <TrainingMatrixBuilder onSelectPlan={handleSimulateUpdate} />
      </Box>

      <RetrainingImpactModal
        open={impactOpen}
        onClose={() => setImpactOpen(false)}
        sopTitle={selectedPlan?.title || "SOP-001: Gowning Procedure"}
        oldVersion={selectedPlan?.version || "v1.0"}
        newVersion="v2.0"
        onConfirm={handleInitiateRetraining}
        plan={selectedPlan}
      />
    </Box>
  );
}
