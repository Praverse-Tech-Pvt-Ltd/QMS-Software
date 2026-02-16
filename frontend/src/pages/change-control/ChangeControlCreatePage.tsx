import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Grid, // ✅ Standardized Grid Import
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRole } from "../../app/providers/RoleProvider";
import { workflowService } from "../../services/workflow.service";
import { auditService } from "../../services/audit.service";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  changeType: z.string().min(1, "Change Type is required"),
  priority: z.string().min(1, "Priority is required"),
  department: z.string().min(1, "Department is required"),
  owner: z.string().min(2, "Owner name is required"),
  implementationDate: z
    .string()
    .min(1, "Target implementation date is required"),
  description: z.string().min(10, "Description must be detailed"),
  justification: z.string().min(10, "Justification is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ChangeControlCreatePage() {
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
      changeType: "Major",
      priority: "Medium",
      department: "Engineering",
      owner: "",
      implementationDate: "",
      description: "",
      justification: "",
    },
  });

  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      const newId = `CC-2024-${Math.floor(Math.random() * 1000)}`;

      const initialStatus = action === "Draft" ? "Draft" : "QA Review";
      console.log(`Creating Change Control (${initialStatus}):`, data);

      workflowService.getOrCreate(newId, "change");

      auditService.add("change", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role || "Unknown",
        reason: `Initiated Change Request (${action}) - Status: ${initialStatus}`,
      });

      enqueueSnackbar(`Change Control ${newId} initiated successfully`, {
        variant: "success",
      });
      navigate(`/change-control/${newId}`);
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
        title="Initiate Change Control"
        subtitle="Request a change to facility, equipment, process, or document"
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
          Change Request Form
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          {/* Classification Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Change Title"
                placeholder="e.g. Installation of new HVAC Unit in Warehouse B"
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
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                    <MenuItem value="IT">IT / Systems</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="changeType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Change Type"
                    fullWidth
                    error={!!errors.changeType}
                  >
                    <MenuItem value="Minor">Minor (Document/SOP)</MenuItem>
                    <MenuItem value="Major">Major (Process/Equipment)</MenuItem>
                    <MenuItem value="Critical">
                      Critical (Regulatory Impact)
                    </MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Priority"
                    fullWidth
                    error={!!errors.priority}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Target Implementation Date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("implementationDate")}
                error={!!errors.implementationDate}
                helperText={errors.implementationDate?.message}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Details Section */}
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            Change Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Initiator / Owner"
                fullWidth
                placeholder="Who is responsible for this change?"
                {...register("owner")}
                error={!!errors.owner}
                helperText={errors.owner?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description of Change"
                multiline
                rows={4}
                fullWidth
                placeholder="Describe the current state vs. proposed state in detail..."
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Justification / Reason for Change"
                multiline
                rows={3}
                fullWidth
                placeholder="Why is this change necessary? (e.g. Regulatory requirement, efficiency improvement, equipment failure)"
                {...register("justification")}
                error={!!errors.justification}
                helperText={errors.justification?.message}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Note: Impact Assessment and Risk Evaluation will be performed in the
            next step after creation.
          </Typography>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{ submit: "Initiate Change Request", draft: "Save Draft" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
