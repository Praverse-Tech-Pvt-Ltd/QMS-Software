import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Stack
} from "@mui/material";
import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import type {
  WorkflowMeta,
  WorkflowModuleKey,
  WorkflowTransition
} from "../../services/workflow.service";
import { WORKFLOWS } from "../../config/workflows"; 
import { workflowService } from "../../services/workflow.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import type { ModuleKey } from "../../services/permission.service";
import { auditService } from "../../services/audit.service";
import ESignModal from "./ESignModal";

export default function WorkflowActionsPanel({
  recordId,
  moduleKey,
  meta,
  onUpdated,
  onValidate, 
}: {
  recordId: string;
  moduleKey: WorkflowModuleKey;
  meta: WorkflowMeta;
  onUpdated: (m: WorkflowMeta) => void;
  onValidate?: () => boolean | string; 
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

  const [comment, setComment] = useState("");
  const [esignOpen, setEsignOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [pendingTransition, setPendingTransition] = useState<WorkflowTransition | null>(null);

  const availableTransitions = useMemo(() => {
    if (!role) return [];
    const moduleConfig = WORKFLOWS[moduleKey];
    if (!moduleConfig) return [];

    const potentialTransitions = moduleConfig.transitions[meta.status] || [];

    return potentialTransitions.filter((t: WorkflowTransition) => {
      const roleAllowed = t.requiredRole.includes(role) || t.requiredRole.includes('Admin');
      
      let permissionAllowed = true;
      if (t.action === 'APPROVE' || t.action === 'REJECT') {
        permissionAllowed = permissionService.can(role, moduleKey as ModuleKey, 'approve');
      } else if (t.action === 'SUBMIT') {
        permissionAllowed = permissionService.can(role, moduleKey as ModuleKey, 'edit');
      }
      
      return roleAllowed && permissionAllowed;
    });
  }, [moduleKey, meta.status, role]);

  const handleActionClick = (transition: WorkflowTransition) => {
    if (transition.action === 'SUBMIT' || transition.action === 'APPROVE') {
        if (onValidate) {
            const validationResult = onValidate();
            if (typeof validationResult === 'string') {
                enqueueSnackbar(validationResult, { variant: "error" });
                return;
            }
            if (validationResult === false) {
                enqueueSnackbar("Please complete mandatory fields.", { variant: "error" });
                return;
            }
        }
    }

    setPendingTransition(transition);
    if (transition.requiresEsig) {
      setEsignOpen(true);
    } else if (transition.requiresComment && !comment.trim()) {
       enqueueSnackbar("A comment is required for this action.", { variant: "warning" });
    } else {
      executeTransition(transition, comment, null);
    }
  };

  const executeTransition = async (
    transition: WorkflowTransition, 
    finalComment: string, 
    signatureData: any | null
  ) => {
    setLoading(true);
    try {
      const result = await workflowService.transition(
        recordId,
        moduleKey,
        transition.action,
        { user: signatureData?.username || "Current User", role: role || "Viewer" }, 
        finalComment
      );

      if ('error' in result) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }

      await auditService.add(moduleKey, recordId, {
        actionType: signatureData ? "E_SIGNATURE" : (transition.action === 'REJECT' ? "REJECT" : "STATUS_CHANGE"),
        field: "status",
        oldValue: meta.status,
        newValue: result.status,
        user: signatureData?.username || "System",
        role: role || "Viewer",
        reason: finalComment || transition.label,
      });

      onUpdated(result);
      setComment("");
      setEsignOpen(false);
      setPendingTransition(null);
      enqueueSnackbar(`Status updated to ${result.status}`, { variant: "success" });

    } catch (err: any) {
      enqueueSnackbar(err.message || "Transition failed", { variant: "error" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Workflow Actions</Typography>
        <Chip label={meta.status} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          availableTransitions.map((t: WorkflowTransition, i: number) => (
            <Button
              key={i}
              variant={t.variant === 'default' ? "outlined" : "contained"}
              color={t.variant === 'error' ? "error" : t.variant === 'success' ? "success" : "primary"}
              startIcon={t.action === 'APPROVE' ? <CheckCircleIcon /> : t.action === 'REJECT' ? <CancelIcon /> : <PlayArrowIcon />}
              onClick={() => handleActionClick(t)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {t.label}
            </Button>
          ))
        )}
      </Box>

      {/* ✅ FIX: Added WorkflowTransition type to 't' in the .some() callback */}
      {availableTransitions.some((t: WorkflowTransition) => t.requiresComment) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
            Comments / Justification (Required for Rejections)
          </Typography>
          <TextField
            placeholder="Enter reason or comments here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth multiline rows={2} size="small"
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={1}>History</Typography>
      <Stack spacing={1}>
        {meta.approvalsLog?.slice(0, 3).map((log: any, i: number) => (
          <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: '1px solid #e2e8f0' }}>
            <Typography variant="body2" fontWeight={700}>{log.action}</Typography>
            <Typography variant="caption" display="block">
              {log.user} ({log.role}) • {new Date(log.timestamp).toLocaleDateString()}
            </Typography>
            {log.comment && <Typography variant="caption" sx={{ fontStyle: 'italic' }}>"{log.comment}"</Typography>}
          </Box>
        ))}
      </Stack>

      {pendingTransition && (
        <ESignModal
          open={esignOpen}
          onClose={() => {
            setEsignOpen(false);
            setPendingTransition(null);
          }}
          actionLabel={pendingTransition.label}
          forcedMeaning={pendingTransition.action === 'APPROVE' ? 'Approval' : undefined}
          onSign={(data) => executeTransition(pendingTransition, data.comment || comment, data)}
        />
      )}
    </Paper>
  );
}