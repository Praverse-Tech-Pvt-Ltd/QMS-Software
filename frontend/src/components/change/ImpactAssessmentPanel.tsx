import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Chip,
  Alert,
 Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useMemo, useState } from "react";
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface ImpactAssessmentPanelProps {
  readOnly?: boolean;
}

type PlanRow = {
  id: number;
  step: string;
  owner: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Done";
};

export default function ImpactAssessmentPanel({ readOnly = false }: ImpactAssessmentPanelProps) {
  // State: Impact Areas
  const [impact, setImpact] = useState({
    validation: true,
    regulatory: false,
    stability: false,
    documents: true,
    training: true,
    supplier: false,
    it_systems: false,
    ehs: false,
  });

  // State: Risk Assessment
  const [riskLevel, setRiskLevel] = useState("Medium");
  const [riskNotes, setRiskNotes] = useState("");
  const [mitigation, setMitigation] = useState("");

  // State: Implementation Plan (Mock Data)
  const [planRows] = useState<PlanRow[]>([
    { id: 1, step: "Update SOP and controlled documents", owner: "QA Lead", dueDate: "2026-01-25", status: "In Progress" },
    { id: 2, step: "Conduct training for impacted employees", owner: "Training Coordinator", dueDate: "2026-01-28", status: "Pending" },
    { id: 3, step: "Perform validation verification", owner: "Validation Team", dueDate: "2026-02-02", status: "Pending" },
  ]);

  // Derived State
  const impactCount = useMemo(() => Object.values(impact).filter(Boolean).length, [impact]);
  const impactBadgeColor = impactCount >= 4 ? "error" : impactCount >= 2 ? "warning" : "success";

  // Configuration for Checkboxes to map cleanly
  const impactAreas = [
      { key: 'validation', label: 'Validation (IQ/OQ/PQ)' },
      { key: 'regulatory', label: 'Regulatory Filing' },
      { key: 'stability', label: 'Stability Studies' },
      { key: 'documents', label: 'SOPs / Documentation' },
      { key: 'training', label: 'Training / Learning' },
      { key: 'supplier', label: 'Supplier / Quality Agreement' },
      { key: 'it_systems', label: 'IT / Computer Systems' },
      { key: 'ehs', label: 'EHS / Safety' },
  ];

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: readOnly ? "#fafafa" : "white"
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Impact Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Evaluate functional and compliance impact before implementation.
          </Typography>
        </Box>
        <Chip
          label={`${impactCount} Areas Impacted`}
          color={impactBadgeColor}
          variant={impactCount > 0 ? "filled" : "outlined"}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* 1. IMPACT AREAS GRID */}
      <Grid container spacing={2}>
        {impactAreas.map((area) => (
             <Grid size={{ xs: 12, sm: 6, md: 3 }} key={area.key}>
                <Paper variant="outlined" sx={{ px: 2, py: 1, bgcolor: readOnly ? 'transparent' : '#fff' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={impact[area.key as keyof typeof impact]}
                                onChange={(e) => setImpact((p) => ({ ...p, [area.key]: e.target.checked }))}
                                disabled={readOnly}
                            />
                        }
                        label={<Typography variant="body2" fontWeight={500}>{area.label}</Typography>}
                    />
                </Paper>
             </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 2. RISK ASSESSMENT */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
         <SecurityIcon color="warning" />
         <Typography variant="h6" sx={{ fontWeight: 800 }}>Risk Assessment</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
            <TextField
                select
                label="Overall Risk Level"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                disabled={readOnly}
                fullWidth
            >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
            </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
            <TextField
                label="Risk Justification"
                value={riskNotes}
                onChange={(e) => setRiskNotes(e.target.value)}
                placeholder="Describe risk and potential quality impact..."
                disabled={readOnly}
                fullWidth
                size="small"
            />
        </Grid>
        <Grid size={{ xs: 12 }}>
            <TextField
                label="Mitigation / Control Plan"
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                multiline
                rows={2}
                placeholder="Steps to mitigate the identified risks..."
                disabled={readOnly}
                fullWidth
            />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 3. IMPLEMENTATION PLAN TABLE */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
         <AssignmentIcon color="primary" />
         <Typography variant="h6" sx={{ fontWeight: 800 }}>Implementation Plan</Typography>
      </Box>

      {!readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
            You can add new implementation steps in Edit mode.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Step Description</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {planRows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.step}</TableCell>
                        <TableCell>{row.owner}</TableCell>
                        <TableCell>{row.dueDate}</TableCell>
                        <TableCell>
                            <Chip 
                                label={row.status} 
                                size="small" 
                                color={row.status === 'Done' ? 'success' : 'default'} 
                                variant="outlined"
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </Paper>
    </Paper>
  );
}