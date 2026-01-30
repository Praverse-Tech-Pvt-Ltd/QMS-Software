import { 
  Paper, Typography, Box, Grid, TextField, 
  MenuItem, Divider, Alert 
} from "@mui/material";
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DeviationEventPanelProps {
  readOnly?: boolean;
}

export default function DeviationEventPanel({ readOnly = false }: DeviationEventPanelProps) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <ScienceIcon color="primary" fontSize="large" />
        <Box>
            <Typography variant="h6" fontWeight={900}>Event Context & Investigation</Typography>
            <Typography variant="body2" color="text.secondary">
                Capture batch details, immediate containment, and root cause.
            </Typography>
        </Box>
      </Box>

      {/* 1. PHARMA FIELDS */}
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'primary.main' }}>
         A. EVENT DETAILS
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
         <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Batch / Lot Number" defaultValue="B-2025-099" fullWidth size="small" disabled={readOnly} />
         </Grid>
         <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Product / Material" defaultValue="Paracetamol 500mg" fullWidth size="small" disabled={readOnly} />
         </Grid>
         <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Equipment ID" defaultValue="EQ-BLENDER-04" fullWidth size="small" disabled={readOnly} />
         </Grid>
         <Grid size={{ xs: 12, md: 3 }}>
            <TextField label="Area / Room" defaultValue="Zone A - Room 104" fullWidth size="small" disabled={readOnly} />
         </Grid>
         <Grid size={{ xs: 12, md: 6 }}>
             <TextField select label="Severity Classification" defaultValue="Major" fullWidth size="small" disabled={readOnly}>
                <MenuItem value="Critical">Critical (Patient Safety Impact)</MenuItem>
                <MenuItem value="Major">Major (Process Impact)</MenuItem>
                <MenuItem value="Minor">Minor (Procedural)</MenuItem>
             </TextField>
         </Grid>
         <Grid size={{ xs: 12, md: 6 }}>
             <TextField type="datetime-local" label="Event Date/Time" defaultValue="2025-02-10T14:30" fullWidth size="small" disabled={readOnly} />
         </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* 2. CONTAINMENT */}
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'error.main' }}>
         B. IMMEDIATE CONTAINMENT
      </Typography>
      <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
         Actions taken immediately to prevent further impact (e.g., Line Stop, Segregation).
      </Alert>
      <TextField 
         label="Containment Actions Taken"
         defaultValue="Process stopped immediately. Batch segregated and labeled 'QUARANTINE'. QA notified."
         fullWidth multiline rows={3} disabled={readOnly}
      />

      <Divider sx={{ my: 3 }} />

      {/* 3. ROOT CAUSE */}
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: 'success.dark' }}>
         C. ROOT CAUSE ANALYSIS (RCA)
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
             <TextField select label="RCA Tool Used" defaultValue="5-Whys" fullWidth disabled={readOnly}>
                <MenuItem value="5-Whys">5-Whys</MenuItem>
                <MenuItem value="Fishbone">Fishbone (Ishikawa)</MenuItem>
                <MenuItem value="FMEA">FMEA</MenuItem>
             </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
             <TextField select label="Root Cause Category" defaultValue="Equipment" fullWidth disabled={readOnly}>
                <MenuItem value="Man">Man (Personnel)</MenuItem>
                <MenuItem value="Machine">Machine (Equipment)</MenuItem>
                <MenuItem value="Method">Method (SOP)</MenuItem>
                <MenuItem value="Material">Material</MenuItem>
                <MenuItem value="Environment">Environment</MenuItem>
             </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
            <TextField 
                label="Investigation Findings" 
                placeholder="Describe the root cause..." 
                defaultValue="Sensor calibration drift caused false temperature reading."
                fullWidth multiline rows={4} disabled={readOnly} 
            />
        </Grid>
      </Grid>
    </Paper>
  );
}