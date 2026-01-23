import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import PeriodicReviewCard from "../../components/dms/PeriodicReviewCard";
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

export default function DmsDetailPage() {
  const { id } = useParams();

  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "dms");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("dms", id));
  }, [id, meta?.status]);

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="Document Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/dms"
      statusChip={<StatusChip status={meta.status as any} />}
      rightPanel={
        <Box sx={{ display: "grid", gap: 2 }}>
          <WorkflowTimeline currentStatus={meta.status} />

          <WorkflowActionsPanel
            recordId={id}
            moduleKey="dms"
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
            Controlled document record placeholder. Later includes versioning,
            effective date, reviewers, and controlled copy distribution.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            Audit Trail (placeholder) • e-Signature required (placeholder)
          </Typography>
          
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            <VersionHistoryPanel
              currentVersion="v1.1"
              rows={[
                {
                  version: "v1.1",
                  status: "Effective",
                  effectiveDate: "2026-01-10",
                  updatedBy: "QA Lead",
                  updatedAt: "2026-01-11",
                },
                {
                  version: "v1.0",
                  status: "Closed",
                  effectiveDate: "2025-10-01",
                  updatedBy: "QA Manager",
                  updatedAt: "2025-10-02",
                },
              ]}
              onView={(v) => console.log("View version:", v)}
            />

            <PeriodicReviewCard />
          </Box>
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
