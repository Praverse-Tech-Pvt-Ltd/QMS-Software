import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
  Alert
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
import { auditService } from "../../services/audit.service";
import ESignModal from "./ESignModal";

export default function WorkflowActionsPanel({
  recordId,
  moduleKey,
  meta,
  onUpdated,
  onValidate, // ✅ New Prop: Parent can inject validation logic
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
  
  // Stores the full configuration object of the action being attempted
  const [pendingTransition, setPendingTransition] = useState<WorkflowTransition | null>(null);

  // ---------------------------------------------------------------------------
  // 1. COMPUTE ALLOWED ACTIONS (The "Brain")
  // ---------------------------------------------------------------------------
  const availableTransitions = useMemo(() => {
    const moduleConfig = WORKFLOWS[moduleKey];
    if (!moduleConfig) return [];

    // Get all possible transitions from the current status
    const potentialTransitions = moduleConfig.transitions[meta.status] || [];

    // Filter by User Role (RBAC)
    return potentialTransitions.filter((t) => 
      t.requiredRole.includes(role) || t.requiredRole.includes('Admin')
    );
  }, [moduleKey, meta.status, role]);

  // ---------------------------------------------------------------------------
  // 2. HANDLERS
  // ---------------------------------------------------------------------------
  const handleActionClick = (transition: WorkflowTransition) => {
    
    // ✅ 1. Check Transition Rules (Validation)
    // We only enforce validation on "forward" actions (Submit/Approve), usually not Reject.
    if (transition.action === 'SUBMIT' || transition.action === 'APPROVE') {
        if (onValidate) {
            const validationResult = onValidate();
            
            // If validation returns a string, it's a specific error message
            if (typeof validationResult === 'string') {
                enqueueSnackbar(validationResult, { variant: "error" });
                return;
            }
            
            // If validation returns false (generic error)
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

    // If it's a simple state change (no sig), just do it
    // Check if comment is required (e.g. for Rejection)
    if (transition.requiresComment && !comment) {
       enqueueSnackbar("A comment/reason is required for this action.", { variant: "warning" });
       return;
    }
    
    // Execute direct transition
    executeTransition(transition, comment, null);
  };

  const executeTransition = (
    transition: WorkflowTransition, 
    finalComment: string, 
    signatureData: any | null
  ) => {
    try {
      // 1. Call Workflow Service
      const updated = workflowService.transition(
        recordId,
        moduleKey,
        transition.action,
        { user: signatureData?.username || "Demo User", role }, // Mock user context
        finalComment,
        transition.action === 'REJECT' ? finalComment : undefined // Pass rejection reason if applicable
      );

      // 2. Record Signature (if applicable)
      if (signatureData) {
        workflowService.addSignature(recordId, moduleKey, {
          meaning: signatureData.meaning,
          statusBefore: meta.status,
          statusAfter: updated.status,
          signedBy: signatureData.username || "Demo User",
          role,
          comment: finalComment,
        });
      }

      // 3. Audit Log
      auditService.add(moduleKey, recordId, {
        actionType: transition.action === 'REJECT' ? "REJECT" : "STATUS_CHANGE",
        field: "status",
        oldValue: meta.status,
        newValue: updated.status,
        user: signatureData?.username || "Demo User",
        role,
        reason: finalComment || transition.label,
      });

      // 4. Update UI
      onUpdated(updated);
      resetForm();
      
      // Determine success message style
      const variant = transition.variant === 'error' ? 'info' : 'success';
      enqueueSnackbar(`Success: ${transition.label}`, { variant });

    } catch (err) {
      console.error(err);
      enqueueSnackbar("Workflow transition failed", { variant: "error" });
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
  
  // Visual Helper: Shows the flow of states 
  
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

      {/* --- Action Buttons (Generated from Config) --- */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {availableTransitions.length > 0 ? (
          availableTransitions.map((t, index) => {
             // Icon Selection
             let Icon = PlayArrowIcon;
             if (t.action === 'APPROVE') Icon = CheckCircleIcon;
             if (t.action === 'REJECT') Icon = CancelIcon;

             return (
              <Button
                key={index}
                variant={t.variant === 'secondary' ? "outlined" : "contained"}
                color={t.variant === 'error' ? "error" : t.variant === 'success' ? "success" : "primary"}
                startIcon={<Icon />}
                onClick={() => handleActionClick(t)}
                // Disable rejection button strictly if no comment is typed yet
                disabled={t.requiresComment && !comment && t.variant === 'error'} 
              >
                {t.label}
              </Button>
             );
          })
        ) : (
          <Alert severity="info" sx={{ width: '100%' }}>
            No actions available for your role ({role}) in this state.
          </Alert>
        )}
      </Box>

      {/* --- Comment Field (Context-Aware) --- */}
      {availableTransitions.some(t => t.requiresComment) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            Comments / Justification (Required for Rejections or Obsolete)
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
        {meta.approvalsLog && meta.approvalsLog.slice(0, 3).map((log) => (
          <Box
            key={log.id}
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
                    {new Date(log.timestamp).toLocaleDateString()}
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
            // If the config says this is an "APPROVE" action, force meaning to "Approval"
            forcedMeaning={pendingTransition.action === 'APPROVE' ? 'Approval' : undefined}
            onSign={(payload) => {
                executeTransition(pendingTransition, payload.comment || comment, payload);
            }}
        />
      )}
    </Paper>
  );
}