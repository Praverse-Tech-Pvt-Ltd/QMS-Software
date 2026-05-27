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
  Grid, // ✅ Updated to Grid2
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
  // ✅ Default to "MINOR" to align with backend enum
  const riskLevel = data?.risk_level || "MINOR";

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
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        bgcolor: readOnly ? "#f8fafc" : "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Quality Impact Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Identify all quality-related areas affected by this change.
          </Typography>
        </Box>
        <Chip
          label={`${impactCount} Areas Impacted`}
          color={
            impactCount > 3 ? "error" : impactCount > 0 ? "warning" : "default"
          }
          sx={{ fontWeight: 700, borderRadius: 2 }}
        />
      </Box>

      <Grid container spacing={2}>
        {impactAreas.map((area) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={area.key}>
            <Paper
              variant="outlined"
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                transition: "0.2s",
                bgcolor: impact[area.key] ? "#eff6ff" : "transparent",
                borderColor: impact[area.key] ? "#3b82f6" : "#e2e8f0",
              }}
            >
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
                label={
                  <Typography
                    variant="body2"
                    fontWeight={impact[area.key] ? 600 : 400}
                  >
                    {area.label}
                  </Typography>
                }
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", gap: 1.5, mb: 3, alignItems: "center" }}>
        <SecurityIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Risk Evaluation
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            label="Overall Risk Level"
            value={riskLevel}
            fullWidth
            disabled={readOnly}
            onChange={(e) => onChange({ ...data, risk_level: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          >
            <MenuItem value="MINOR">Minor (Low Impact)</MenuItem>
            <MenuItem value="MAJOR">Major (Moderate Impact)</MenuItem>
            <MenuItem value="CRITICAL">Critical (High Impact)</MenuItem>
            <MenuItem value="EMERGENCY">Emergency (Urgent)</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            label="Risk Justification & Mitigation"
            value={data?.risk_notes || ""}
            fullWidth
            multiline
            rows={2}
            placeholder="Explain the rationale for the selected risk level and any planned mitigations..."
            disabled={readOnly}
            onChange={(e) => onChange({ ...data, risk_notes: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Grid>
      </Grid>

      {readOnly && impactCount === 0 && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 2, display: "block", fontWeight: 600 }}
        >
          * No impact areas were selected for this change request.
        </Typography>
      )}
    </Paper>
  );
}
