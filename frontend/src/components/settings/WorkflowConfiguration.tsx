import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Paper,
} from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { WORKFLOWS } from "../../config/workflows";
// ✅ Import types to satisfy the compiler
import type { WorkflowTransition, WorkflowStep } from "../../services/workflow.service";

export default function WorkflowConfiguration() {
  const modules = ["dms", "deviations", "capa", "change"];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <AccountTreeIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Workflow Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View configured lifecycles and transition rules (Read-Only)
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>System Integrity:</strong> Workflow definitions are managed via secure configuration files to prevent unauthorized changes to quality processes.
      </Alert>

      {modules.map((moduleKey) => {
        const workflow = WORKFLOWS[moduleKey as keyof typeof WORKFLOWS];
        if (!workflow) return null;

        return (
          <Paper key={moduleKey} sx={{ p: 3, mb: 3, border: "1px solid #e2e8f0", borderRadius: 3, boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, textTransform: "uppercase", color: 'primary.main', fontSize: '0.85rem' }}>
              {moduleKey} Module
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#64748b" }}>
                Configured States:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {/* ✅ FIXED: Added WorkflowStep type to 'step' */}
                {workflow.steps.map((step: WorkflowStep) => (
                  <Chip
                    key={step.id}
                    label={step.label}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: step.status === "CLOSED" || step.status === "EFFECTIVE" ? "#dcfce7" : "#f1f5f9",
                      color: step.status === "CLOSED" || step.status === "EFFECTIVE" ? "#15803d" : "#475569",
                      borderRadius: 1
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#64748b" }}>
              Transition Rules:
            </Typography>
            <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem' }}>FROM</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem' }}>ACTION</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem' }}>TO</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem' }}>AUTHORIZED ROLES</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.7rem' }} align="center">E-SIG</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(workflow.transitions).map(([fromState, transitions]) =>
                    /* ✅ FIXED: Cast transitions to WorkflowTransition[] to avoid 'unknown' error */
                    (transitions as WorkflowTransition[]).map((transition: WorkflowTransition, idx: number) => (
                      <TableRow key={`${fromState}-${idx}`} hover>
                        <TableCell>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">{fromState}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary.main">{transition.label}</Typography>
                        </TableCell>
                        <TableCell>
                           <Chip label={transition.to} size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell>
                          {transition.requiredRole.map((r: string) => (
                            <Chip key={r} label={r} size="small" sx={{ mr: 0.5, fontSize: "0.6rem", fontWeight: 700, height: 18 }} />
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          {transition.requiresEsig ? (
                            <Chip label="PART 11" size="small" color="error" sx={{ fontWeight: 800, height: 18, fontSize: '0.55rem' }} />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}
    </Box>
  );
}