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
  Grid,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

interface ImpactAssessmentPanelProps {
  data: any;
  onChange: (newData: any) => void;
  readOnly?: boolean;
}

export default function ImpactAssessmentPanel({
  data,
  onChange,
  readOnly = false,
}: ImpactAssessmentPanelProps) {
  const impact = data?.areas || {};
  const riskLevel = data?.risk_level || "Medium";

  const impactAreas = [
    { key: "validation", label: "Validation (IQ/OQ/PQ)" },
    { key: "regulatory", label: "Regulatory Filing" },
    { key: "stability", label: "Stability Studies" },
    { key: "documents", label: "SOPs / Documentation" },
    { key: "training", label: "Training / Learning" },
    { key: "supplier", label: "Supplier Quality" },
    { key: "it_systems", label: "IT Systems" },
    { key: "ehs", label: "EHS / Safety" },
  ];

  const handleAreaChange = (key: string, checked: boolean) => {
    onChange({ ...data, areas: { ...impact, [key]: checked } });
  };

  const impactCount = Object.values(impact).filter(Boolean).length;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: readOnly ? "#fafafa" : "white",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Impact Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Evaluate compliance impact before implementation.
          </Typography>
        </Box>
        <Chip
          label={`${impactCount} Areas Impacted`}
          color={impactCount > 3 ? "error" : "warning"}
          variant="filled"
        />
      </Box>

      <Grid container spacing={2}>
        {impactAreas.map((area) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={area.key}>
            <Paper variant="outlined" sx={{ px: 2, py: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={!!impact[area.key]}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleAreaChange(area.key, e.target.checked)
                    }
                  />
                }
                label={<Typography variant="body2">{area.label}</Typography>}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
        <SecurityIcon color="warning" />
        <Typography variant="h6" fontWeight={800}>
          Risk Assessment
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            label="Risk Level"
            value={riskLevel}
            fullWidth
            disabled={readOnly}
            onChange={(e) => onChange({ ...data, risk_level: e.target.value })}
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
            value={data?.risk_notes || ""}
            fullWidth
            disabled={readOnly}
            onChange={(e) => onChange({ ...data, risk_notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
