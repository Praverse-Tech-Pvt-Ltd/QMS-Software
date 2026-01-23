import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";

import type {
  WorkflowAction,
  WorkflowMeta,
  WorkflowModuleKey,
} from "../../types/workflow.types";
import { workflowService } from "../../services/workflow.service";
import { useRole } from "../../app/providers/RoleProvider";
import ESignModal from "./ESignModal";
import { auditService } from "../../services/audit.service";

export default function WorkflowActionsPanel({
  recordId,
  moduleKey,
  meta,
  onUpdated,
}: {
  recordId: string;
  moduleKey: WorkflowModuleKey;
  meta: WorkflowMeta;
  onUpdated: (m: WorkflowMeta) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [esignOpen, setEsignOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<WorkflowAction | null>(
    null,
  );

  const allowedActions = useMemo(() => {
    // UI-level permissions (can be refined later)
    if (meta.status === "Draft") {
      return role === "Production" ||
        role === "QC" ||
        role === "Warehouse" ||
        role === "Admin"
        ? ["SUBMIT_QA_REVIEW"]
        : [];
    }

    if (meta.status === "QA Review") {
      return role === "QA" || role === "Admin" ? ["APPROVE", "REJECT"] : [];
    }

    if (meta.status === "Approved") {
      return role === "QA" || role === "Admin" ? ["MARK_EFFECTIVE"] : [];
    }

    if (meta.status === "Effective") {
      return role === "QA" || role === "Admin" ? ["CLOSE"] : [];
    }

    return [];
  }, [meta.status, role]);

  const runAction = (action: WorkflowAction) => {
    // Reject needs a reason
    if (action === "REJECT" && rejectReason.trim().length < 3) {
      enqueueSnackbar("Reject reason is required", { variant: "error" });
      return;
    }

    const updated = workflowService.transition(
      recordId,
      moduleKey,
      action,
      { user: "Demo User", role },
      comment,
      rejectReason,
    );

    onUpdated(updated);
    setComment("");
    setRejectReason("");

    enqueueSnackbar(`Status updated to: ${updated.status}`, {
      variant: "success",
    });
  };

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        Workflow Actions
      </Typography>

      <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
        Current Status: <b>{meta.status}</b>
      </Typography>

      <Divider sx={{ my: 2 }} />

      <TextField
        label="Approval Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
        multiline
        rows={2}
      />

      {allowedActions.includes("REJECT") && (
        <TextField
          label="Reject Reason (required)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 2 }}
        />
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mt: 2 }}>
        {allowedActions.includes("SUBMIT_QA_REVIEW") && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingAction("SUBMIT_QA_REVIEW");
              setEsignOpen(true);
            }}
          >
            Submit for QA Review
          </Button>
        )}

        {allowedActions.includes("APPROVE") && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingAction("APPROVE");
              setEsignOpen(true);
            }}
          >
            Approve
          </Button>
        )}

        {allowedActions.includes("REJECT") && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setPendingAction("REJECT");
              setEsignOpen(true);
            }}
          >
            Reject
          </Button>
        )}

        {allowedActions.includes("MARK_EFFECTIVE") && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingAction("MARK_EFFECTIVE");
              setEsignOpen(true);
            }}
          >
            Mark Effective
          </Button>
        )}

        {allowedActions.includes("CLOSE") && (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setPendingAction("CLOSE");
              setEsignOpen(true);
            }}
          >
            Close
          </Button>
        )}

        {allowedActions.length === 0 && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            No actions available for your role at this stage.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
        Approval Log (mock)
      </Typography>

      <Box sx={{ display: "grid", gap: 1 }}>
        {meta.approvalsLog.slice(0, 5).map((log) => (
          <Box
            key={log.id}
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.03)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {log.action} → {log.statusAfter}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {log.user} ({log.role}) •{" "}
              {new Date(log.timestamp).toLocaleString()}
            </Typography>
            {log.comment && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {log.comment}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      <ESignModal
        open={esignOpen}
        title="E-Signature Required"
        onClose={() => {
          setEsignOpen(false);
          setPendingAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingAction) return;

          // Reject needs reason
          if (pendingAction === "REJECT" && rejectReason.trim().length < 3) {
            enqueueSnackbar("Reject reason is required", { variant: "error" });
            return;
          }

          const before = meta.status;

          const updated = workflowService.transition(
            recordId,
            moduleKey,
            pendingAction,
            { user: payload.username || "Demo User", role },
            payload.comment || comment,
            rejectReason,
          );

          // Save signature log entry (mock)
          const finalMeta = workflowService.addSignature(recordId, moduleKey, {
            meaning: payload.meaning,
            statusBefore: before,
            statusAfter: updated.status,
            signedBy: payload.username || "Demo User",
            role,
            comment: payload.comment || comment,
          });

          onUpdated(finalMeta);

          setComment("");
          setRejectReason("");
          setEsignOpen(false);
          setPendingAction(null);

          enqueueSnackbar(`E-Signed. Status updated to: ${finalMeta.status}`, {
            variant: "success",
          });
          auditService.add(moduleKey, recordId, {
            actionType: pendingAction === "REJECT" ? "REJECT" : "STATUS_CHANGE",
            field: "status",
            oldValue: before,
            newValue: updated.status,
            user: payload.username || "Demo User",
            role,
            reason:
              pendingAction === "REJECT"
                ? rejectReason
                : payload.comment || comment || "Status updated",
          });
        }}
      />
    </Paper>
  );
}
