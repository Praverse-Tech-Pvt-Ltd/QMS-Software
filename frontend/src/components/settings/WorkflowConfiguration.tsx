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
import { useRole } from "../../app/providers/RoleProvider";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { WORKFLOWS } from "../../config/workflows";

export default function WorkflowConfiguration() {
  const { role } = useRole();

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
            View configured workflows for quality modules (Read-Only)
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Configuration Locked:</strong> Workflow definitions are managed through system configuration files and cannot be modified via UI.
      </Alert>

      {modules.map((moduleKey) => {
        const workflow = WORKFLOWS[moduleKey as keyof typeof WORKFLOWS];
        if (!workflow) return null;

        return (
          <Paper key={moduleKey} sx={{ p: 3, mb: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textTransform: "uppercase" }}>
              {moduleKey} Workflow
            </Typography>

            {/* States */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#64748b" }}>
                Available States:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {workflow.states.map((state) => (
                  <Chip
                    key={state}
                    label={state}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: state.includes("Closed") || state.includes("Effective") ? "#dcfce7" : "#e0e7ff",
                      color: state.includes("Closed") || state.includes("Effective") ? "#15803d" : "#4338ca",
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Transitions */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#64748b" }}>
              Workflow Transitions:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>From State</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>To State</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Required Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>E-Signature</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(workflow.transitions).map(([fromState, transitions]) =>
                    transitions.map((transition, idx) => (
                      <TableRow key={`${fromState}-${idx}`} hover>
                        <TableCell>
                          <Chip label={fromState} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6366f1" }}>
                          {transition.label}
                        </TableCell>
                        <TableCell>
                          <Chip label={transition.toStatus} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {transition.requiredRole.map((r) => (
                            <Chip key={r} label={r} size="small" sx={{ mr: 0.5, fontSize: "0.7rem" }} />
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          {transition.requiresEsig ? (
                            <Chip label="Required" size="small" color="error" />
                          ) : (
                            <Chip label="Not Required" size="small" />
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
