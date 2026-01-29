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
import SectionTabs from "../../components/qms/SectionTabs";

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
  // Basic
  title: z.string().min(5, "Title must describe the event clearly"),
  department: z.string().min(1, "Department is required"),
  reportedBy: z.string().min(2, "Reporter name is required"),
  incidentDate: z.string().min(1, "Date of Incident is required"),
  severity: z.string().min(1, "Severity is required"),
  classification: z.string().min(1, "Classification is required"),
  description: z.string().min(10, "Description must be detailed"),

  // Containment
  immediateAction: z.string().min(5, "Immediate action taken is required"),
  batchNo: z.string().optional(), // Optional for some deviations
  productName: z.string().optional(),
  impactedArea: z.string().min(2, "Impacted area is required"),

  // CAPA Linkage
  capaRequired: z.string().min(1, "CAPA requirement must be selected"),
});

type FormValues = z.infer<typeof schema>;

export default function DeviationsCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      department: "Production",
      reportedBy: "", // Could default to current user
      incidentDate: new Date().toISOString().split("T")[0],
      severity: "Medium",
      classification: "Process",
      description: "",
      immediateAction: "",
      batchNo: "",
      productName: "",
      impactedArea: "",
      capaRequired: "No",
    },
  });

  const capaRequiredValue = watch("capaRequired");

  // Reusable Create Logic
  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // 1. Generate ID (Mock)
      const newId = `DEV-2024-${Math.floor(Math.random() * 1000)}`;
      const initialStatus = action === "Draft" ? "Draft" : "Investigation"; // Deviations jump to Investigation

      // 2. Persist Data
      workflowService.getOrCreate(newId, "deviations");

      // 3. Log Audit
      auditService.add("deviations", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role,
        reason: `Initial Deviation Report (${action})`,
      });

      // 4. Redirect
      enqueueSnackbar(`Deviation ${newId} raised successfully`, {
        variant: "success",
      });
      navigate(`/deviations/${newId}`);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to create record", { variant: "error" });
    }
  };

  const onSaveDraft = (data: FormValues) => handleCreate(data, "Draft");
  const onSubmitReview = (data: FormValues) => handleCreate(data, "Submit");

  return (
    <Box>
      <PageHeader
        title="Raise Deviation / Incident"
        subtitle="Report a quality event or non-conformance"
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
          Event Report
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          {/* Basic Information Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Short Description / Title"
                placeholder="e.g. Temperature Excursion in Warehouse B"
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
                    label="Department"
                    fullWidth
                    error={!!errors.department}
                  >
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Date of Incident"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("incidentDate")}
                error={!!errors.incidentDate}
                helperText={errors.incidentDate?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="classification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Event Type"
                    fullWidth
                    error={!!errors.classification}
                  >
                    <MenuItem value="Process">Process Deviation</MenuItem>
                    <MenuItem value="Equipment">Equipment Failure</MenuItem>
                    <MenuItem value="Safety">Safety Incident</MenuItem>
                    <MenuItem value="Documentation">
                      Documentation Error
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Initial Severity"
                    fullWidth
                    error={!!errors.severity}
                  >
                    <MenuItem value="Minor">Minor</MenuItem>
                    <MenuItem value="Major">Major</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Description of Event"
                multiline
                rows={4}
                fullWidth
                placeholder="Describe what happened, where, and who was involved..."
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Containment & Impact */}
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            Immediate Actions & Impact
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Immediate Containment Action"
                multiline
                rows={2}
                fullWidth
                placeholder="What was done immediately to contain the issue? (e.g. stopped line, quarantined batch)"
                {...register("immediateAction")}
                error={!!errors.immediateAction}
                helperText={errors.immediateAction?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Product Name (if applicable)"
                fullWidth
                {...register("productName")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Batch / Lot Number"
                fullWidth
                {...register("batchNo")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Impacted Area / Equipment ID"
                fullWidth
                {...register("impactedArea")}
                error={!!errors.impactedArea}
                helperText={errors.impactedArea?.message}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Initial Assessment */}
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            Initial Assessment
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="capaRequired"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Does this require a CAPA?"
                    fullWidth
                    helperText="If yes, a CAPA record will be linked upon approval."
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">
                      No (Justification required in closure)
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{ submit: "Submit Report", draft: "Save Draft" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
