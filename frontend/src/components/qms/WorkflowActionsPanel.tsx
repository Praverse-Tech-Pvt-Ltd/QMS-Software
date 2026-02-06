import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress
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
} from "../../types/workflow.types";
import { WORKFLOWS } from "../../config/workflows"; 
import { workflowService } from "../../services/workflow.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
import type { ModuleKey } from "../../types/permissions.types";
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

  // State
  const [comment, setComment] = useState("");
  const [esignOpen, setEsignOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  // Stores the full configuration object of the action being attempted
  const [pendingTransition, setPendingTransition] = useState<WorkflowTransition | null>(null);

  // ---------------------------------------------------------------------------
  // 1. COMPUTE ALLOWED ACTIONS
  // ---------------------------------------------------------------------------
  const availableTransitions = useMemo(() => {
    // ✅ FIX: If no role (not logged in), no actions allowed.
    if (!role) return [];

    const moduleConfig = WORKFLOWS[moduleKey];
    if (!moduleConfig) return [];

    // Get all possible transitions from the current status
    // Safe check: Ensure status exists in config, default to empty array
    const potentialTransitions = moduleConfig.transitions[meta.status] || [];

    // Filter by User Role (RBAC) AND Permission Check
    return potentialTransitions.filter((t) => {
      // Check if role is allowed by workflow config
      const roleAllowed = t.requiredRole.includes(role) || t.requiredRole.includes('Admin');
      
      // Check if role has the required permission for the action type
      let permissionAllowed = true;
      // We assume standard CRUD permissions map to workflow actions
      if (t.action === 'APPROVE' || t.action === 'REJECT') {
        permissionAllowed = permissionService.can(role, moduleKey as ModuleKey, 'approve');
      } else if (t.action === 'SUBMIT') {
        permissionAllowed = permissionService.can(role, moduleKey as ModuleKey, 'edit');
      }
      
      return roleAllowed && permissionAllowed;
    });
  }, [moduleKey, meta.status, role]);

  // ---------------------------------------------------------------------------
  // 2. HANDLERS
  // ---------------------------------------------------------------------------
  const handleActionClick = (transition: WorkflowTransition) => {
    
    // ✅ 1. Check Transition Rules (Validation)
    if (transition.action === 'SUBMIT' || transition.action === 'APPROVE') {
        if (onValidate) {
            const validationResult = onValidate();
            
            if (typeof validationResult === 'string') {
                enqueueSnackbar(validationResult, { variant: "error" });
                return;
            }
            
            if (validationResult === false) {
                enqueueSnackbar("Please complete all mandatory fields before proceeding.", { variant: "error" });
                return;
            }
        }
    }

    setPendingTransition(transition);
    
    // If it requires E-Sig, open modal immediately
    if (transition.requiresEsig) {
      setEsignOpen(true);
      return;
    }

    // If it's a simple state change (no sig), check comment requirement
    if (transition.requiresComment && !comment.trim()) {
       enqueueSnackbar("A comment/reason is required for this action.", { variant: "warning" });
       return;
    }
    
    // Execute direct transition
    executeTransition(transition, comment, null);
  };

  const executeTransition = async (
    transition: WorkflowTransition, 
    finalComment: string, 
    signatureData: any | null
  ) => {
    if (!role) {
        enqueueSnackbar("You must be logged in to perform this action.", { variant: "error" });
        return;
    }

    setLoading(true);
    try {
      // 1. Call Workflow Service
      const updated = await workflowService.transition(
        recordId,
        moduleKey,
        transition.action,
        { user: signatureData?.username || "Current User", role }, 
        finalComment,
        transition.action === 'REJECT' ? finalComment : undefined 
      );

      // 2. Record Signature (if applicable)
      if (signatureData) {
        // Only attempt to add signature if the service supports it (safe check)
        if (workflowService.addSignature) {
            await workflowService.addSignature(recordId, moduleKey, {
            meaning: signatureData.meaning,
            statusBefore: meta.status,
            statusAfter: updated.status,
            signedBy: signatureData.username || "Current User",
            role,
            comment: finalComment,
            });
        }
      }

      // 3. Audit Log
      auditService.add(moduleKey, recordId, {
        actionType: transition.action === 'REJECT' ? "REJECT" : "STATUS_CHANGE",
        field: "status",
        oldValue: meta.status,
        newValue: updated.status,
        user: signatureData?.username || "Current User",
        role,
        reason: finalComment || transition.label,
      });

      // 4. Update UI
      onUpdated(updated);
      resetForm();
      
      const variant = transition.variant === 'error' ? 'info' : 'success';
      enqueueSnackbar(`Success: ${transition.label}`, { variant });

    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(err.message || "Workflow transition failed", { variant: "error" });
    } finally {
        setLoading(false);
    }
  };

  const resetForm = () => {
    setComment("");
    setEsignOpen(false);
    setPendingTransition(null);
  };

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        background: '#fcfcfc'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Workflow Actions
        </Typography>
        <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
          Current: <b>{meta.status}</b>
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* --- Action Buttons --- */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {loading ? (
             <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 2 }}>
                 <CircularProgress size={24} />
             </Box>
        ) : availableTransitions.length > 0 ? (
          availableTransitions.map((t, index) => {
             let Icon = PlayArrowIcon;
             if (t.action === 'APPROVE') Icon = CheckCircleIcon;
             if (t.action === 'REJECT') Icon = CancelIcon;

             // Disable if comment required but missing
             const isCommentMissing = t.requiresComment && !comment.trim();
             
             return (
              <Button
                key={index}
                variant={t.variant === 'secondary' ? "outlined" : "contained"}
                color={t.variant === 'error' ? "error" : t.variant === 'success' ? "success" : "primary"}
                startIcon={<Icon />}
                onClick={() => handleActionClick(t)}
                disabled={isCommentMissing && t.variant === 'error'} // Only strictly disable Reject buttons
              >
                {t.label}
              </Button>
             );
          })
        ) : (
          <Alert severity="info" sx={{ width: '100%' }}>
            No actions available for your role ({role || "Viewer"}) in this state.
          </Alert>
        )}
      </Box>

      {/* --- Comment Field --- */}
      {availableTransitions.some(t => t.requiresComment) && !loading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            Comments / Justification (Required for Rejections)
          </Typography>
          <TextField
            placeholder="Enter reason or comments here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* --- History Log --- */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary' }}>
        Workflow History
      </Typography>

      <Box sx={{ display: "grid", gap: 1 }}>
        {/* Safe check for approvalsLog array */}
        {(meta.approvalsLog || []).length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No history yet.
            </Typography>
        )}
        
        {(meta.approvalsLog || []).slice(0, 3).map((log, i) => (
          <Box
            key={log.id || i} // Fallback key
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "white",
              border: '1px solid #eee'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {log.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A'}
                </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>
              {log.user} ({log.role})
            </Typography>
            {log.comment && (
              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                "{log.comment}"
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* --- E-Signature Modal --- */}
      {pendingTransition && (
        <ESignModal
            open={esignOpen}
            onClose={() => {
                setEsignOpen(false);
                setPendingTransition(null);
            }}
            actionLabel={pendingTransition.label}
            forcedMeaning={pendingTransition.action === 'APPROVE' ? 'Approval' : undefined}
            onSign={(payload) => {
                executeTransition(pendingTransition, payload.comment || comment, payload);
            }}
        />
      )}
    </Paper>
  );
}