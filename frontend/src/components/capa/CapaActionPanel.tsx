import {
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";

interface CapaAction {
  id: number;
  description: string;
  owner: string;
  due_date: string;
  status: string;
}

interface CapaActionPanelProps {
  actions: CapaAction[];
  readOnly?: boolean;
}

// const MOCK_ACTIONS = [
//   {
//     id: 1,
//     action: "Replace Sensor Module",
//     owner: "Maintenance",
//     due: "2025-02-20",
//     status: "Done",
//   },
//   {
//     id: 2,
//     action: "Update Calibration SOP",
//     owner: "QA Lead",
//     due: "2025-02-25",
//     status: "In Progress",
//   },
// ];

export default function CapaActionPanel({
  actions = [],
  readOnly = false,
}: CapaActionPanelProps) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FactCheckIcon color="secondary" fontSize="large" />
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Action Plan & Effectiveness
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define corrective actions and verification criteria.
          </Typography>
        </Box>
      </Box>

      {/* 1. ACTION PLAN TABLE */}
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>
        A. PLAN OF ACTION
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Action Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                  No actions defined for this CAPA.
                </TableCell>
              </TableRow>
            ) : (
              actions.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>{row.due_date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} size="small" variant="outlined"
                      color={row.status === 'DONE' ? 'success' : 'warning'} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider sx={{ my: 3 }} />

      {/* 2. EFFECTIVENESS CHECK */}
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>
        B. EFFECTIVENESS CHECK
      </Typography>

      {!readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Effectiveness check must be performed after all actions are closed.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <TextField
          label="Success Criteria"
          defaultValue="Zero recurrence of deviation for 3 consecutive batches."
          fullWidth
          multiline
          rows={2}
          disabled={readOnly}
          sx={{ gridColumn: "1 / -1" }}
        />
        <TextField
          type="date"
          label="Check Due Date"
          defaultValue="2025-06-01"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          disabled={readOnly}
        />
        <TextField
          select
          label="Outcome"
          defaultValue="Pending"
          fullWidth
          size="small"
          disabled={readOnly}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Effective">Effective (Closed)</MenuItem>
          <MenuItem value="Ineffective">Ineffective (Re-Open)</MenuItem>
        </TextField>
        <TextField
          label="Evidence Summary"
          placeholder="Results of the check..."
          fullWidth
          multiline
          rows={3}
          disabled={readOnly}
          sx={{ gridColumn: "1 / -1" }}
        />
      </Box>
    </Paper>
  );
}
