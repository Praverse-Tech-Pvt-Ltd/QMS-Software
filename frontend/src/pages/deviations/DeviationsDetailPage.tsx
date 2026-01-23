import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";

import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";

import AuditTrailTable from "../../components/qms/AuditTrailTable";
import { auditService } from "../../services/audit.service";
import type { AuditTrailEntry } from "../../types/audit.types";

import { workflowService } from "../../services/workflow.service";
import type { WorkflowMeta } from "../../types/workflow.types";
import SignatureLogTable from "../../components/qms/SignatureLogTable";

export default function DeviationsDetailPage() {
  const { id } = useParams();

  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "deviations");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("deviations", id));
  }, [id, meta?.status]);

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="Deviation / Incident Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/deviations"
      statusChip={<StatusChip status={meta.status as any} />}
      rightPanel={
        <Box sx={{ display: "grid", gap: 2 }}>
          <WorkflowTimeline currentStatus={meta.status} />

          <WorkflowActionsPanel
            recordId={id}
            moduleKey="deviations"
            meta={meta}
            onUpdated={setMeta}
          />
        </Box>
      }
      overview={
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overview
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This is a mock deviation record. Later it will include containment
            action, investigation, root cause analysis, impact assessment, and
            CAPA linkage.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            QA Review Required • Audit Trail (placeholder)
          </Typography>
        </Box>
      }
      attachments={<AttachmentsUploader />}
      activity={
        <Box sx={{ display: "grid", gap: 2 }}>
          <ActivityLog />
          <AuditTrailTable rows={auditRows} />
        </Box>
      }
      approvals={
        <Box sx={{ display: "grid", gap: 2 }}>
          <ApprovalsPanel />
          <SignatureLogTable rows={meta.signatureLog || []} />
        </Box>
      }
    />
  );
}
