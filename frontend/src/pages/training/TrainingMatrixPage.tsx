import { Box, Button } from "@mui/material"; 
import PageHeader from "../../components/common/PageHeader";
import TrainingMatrixBuilder from "../../components/training/TrainingMatrixBuilder"; 
import RetrainingImpactModal from "../../components/training/RetrainingImpactModal";
import { useState } from "react";
import UpdateIcon from "@mui/icons-material/Update";

export default function TrainingMatrixPage() {
  const [impactOpen, setImpactOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader
            title="Training Matrix Management"
            subtitle="Define Role-Based Training Requirements (SOPs & Competencies)"
            showBack
        />
        
        <Button 
            variant="outlined" 
            color="warning" 
            startIcon={<UpdateIcon />}
            onClick={() => setImpactOpen(true)}
            sx={{ mt: 1 }}
        >
            Simulate SOP Update
        </Button>
      </Box>

      {/* The Interactive Builder Component */}
      <Box sx={{ mt: 3 }}>
        <TrainingMatrixBuilder />
      </Box>

      {/* The Retraining Modal */}
      <RetrainingImpactModal 
        open={impactOpen}
        onClose={() => setImpactOpen(false)}
        sopTitle="SOP-001: Gowning Procedure"
        oldVersion="v1.0"
        newVersion="v2.0"
      />
    </Box>
  );
}