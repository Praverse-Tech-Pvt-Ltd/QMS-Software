import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Architecture Imports
import { useRole } from "../../app/providers/RoleProvider";
import { workflowService } from "../../services/workflow.service";
import { auditService } from "../../services/audit.service";

// Schema Definition
const schema = z.object({
  title: z.string().min(5, "Title must be descriptive"),
  sourceType: z.string().min(1, "Source is required"),
  sourceReference: z.string().optional(), // e.g. Deviation ID
  department: z.string().min(1, "Department is required"),
  owner: z.string().min(2, "Owner is required"),
  riskLevel: z.string().min(1, "Initial risk level is required"),
  targetDate: z.string().min(1, "Target closure date is required"),
  problemStatement: z
    .string()
    .min(10, "Detailed problem statement is required"),
});

type FormValues = z.infer<typeof schema>;

export default function CapaCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      sourceType: "Deviation",
      sourceReference: "",
      department: "QA",
      owner: "",
      riskLevel: "Medium",
      targetDate: "",
      problemStatement: "",
    },
  });

  // Reusable Create Logic
  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // 1. Generate ID (Mock)
      const newId = `CAPA-2024-${Math.floor(Math.random() * 1000)}`;

      // 2. Persist Data
      // In a real app, we would pass 'data' to this method
      workflowService.getOrCreate(newId, "capa");

      // 3. Log Audit
      auditService.add("capa", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role,
        reason: `CAPA Initiated (${action})`,
      });

      // 4. Redirect
      enqueueSnackbar(`CAPA ${newId} created successfully`, {
        variant: "success",
      });
      navigate(`/capa/${newId}`);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to create CAPA", { variant: "error" });
    }
  };

  const onSaveDraft = (data: FormValues) => handleCreate(data, "Draft");
  const onSubmitReview = (data: FormValues) => handleCreate(data, "Submit");

  return (
    <Box>
      <PageHeader
        title="Initiate CAPA"
        subtitle="Corrective and Preventive Action Request"
        showBack
      />

      <Paper
        sx={{
          mt: 3,
          p: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
          CAPA Initiation Form
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          {/* Source & Classification */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="CAPA Title / Short Description"
                placeholder="e.g. Labeling Error on Line 4 packaging"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Responsible Department"
                    fullWidth
                    error={!!errors.department}
                  >
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="Supply Chain">Supply Chain</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="sourceType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Source of CAPA"
                    fullWidth
                    error={!!errors.sourceType}
                  >
                    <MenuItem value="Deviation">Deviation / Incident</MenuItem>
                    <MenuItem value="Internal Audit">Internal Audit</MenuItem>
                    <MenuItem value="External Audit">
                      Regulatory / External Audit
                    </MenuItem>
                    <MenuItem value="Complaint">Customer Complaint</MenuItem>
                    <MenuItem value="OOS">Out of Specification (OOS)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Source Reference ID"
                placeholder="e.g. DEV-2024-042"
                fullWidth
                {...register("sourceReference")}
                error={!!errors.sourceReference}
                helperText={errors.sourceReference?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="riskLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Initial Risk Assessment"
                    fullWidth
                    error={!!errors.riskLevel}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Problem Details */}
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            Problem Definition
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Problem Statement"
                multiline
                rows={4}
                fullWidth
                placeholder="Describe the non-conformance clearly. What happened? What is the impact?"
                {...register("problemStatement")}
                error={!!errors.problemStatement}
                helperText={errors.problemStatement?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="CAPA Owner"
                fullWidth
                placeholder="Assign a responsible person"
                {...register("owner")}
                error={!!errors.owner}
                helperText={errors.owner?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Target Closure Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("targetDate")}
                error={!!errors.targetDate}
                helperText={errors.targetDate?.message}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Note: Root Cause Analysis (RCA) and Action Plan definition will
            occur in the Investigation phase.
          </Typography>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{ submit: "Initiate CAPA", draft: "Save Draft" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
