import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import type { WorkflowStatus } from "../../config/workflows";

export default function TrainingDetailPage() {
  const { id } = useParams();
const status: WorkflowStatus = "Effective";

  return (
    <DetailTabsLayout
      title="Training Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/training"
      statusChip={<StatusChip status={status} />}
      rightPanel={<WorkflowTimeline moduleKey="training" currentStatus={status} />}

      overview={
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overview
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Training module placeholder. Later includes participants, completion
            tracking, quizzes, and training effectiveness.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            LMS Progress (placeholder) • Completion audit trail (placeholder)
          </Typography>
        </Box>
      }
      attachments={<AttachmentsUploader />}
      activity={<ActivityLog />}
      approvals={<ApprovalsPanel />}
    />
  );
}
