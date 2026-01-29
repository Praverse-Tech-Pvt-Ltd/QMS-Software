import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

// Architecture Imports
import { useRole } from "../../app/providers/RoleProvider";
import { workflowService } from "../../services/workflow.service";
import { auditService } from "../../services/audit.service";
import FormActions from "../../components/common/FormActions";

// Validation Schema
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  docType: z.string().min(1, "Document Type is required"),
  department: z.string().min(1, "Department is required"),
  owner: z.string().min(2, "Owner name is required"),
  description: z.string().min(10, "Description must provide sufficient detail"),
});

type FormValues = z.infer<typeof schema>;

export default function DmsCreatePage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
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
      docType: "SOP",
      department: "QA",
      owner: "",
      description: "",
    },
  });

  // Reusable create logic
  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // 1. Simulate Backend ID Generation
      const newId = `SOP-2024-${Math.floor(Math.random() * 1000)}`;
      const initialStatus = action === "Draft" ? "Draft" : "In Review";

      // 2. Create Record in Workflow Service
      workflowService.getOrCreate(newId, "dms"); // In a real app, you'd pass the form data here

      // 3. Log Audit Trail
      auditService.add("dms", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User", // Replace with real user context
        role: role,
        reason: `Initial creation as ${action}`,
      });

      // 4. Feedback & Redirect
      enqueueSnackbar(
        `Document ${newId} created successfully as ${initialStatus}`,
        { variant: "success" },
      );
      navigate(`/dms/${newId}`); // Redirect to the Detail Page we just built
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Failed to create document", { variant: "error" });
    }
  };

  const onSaveDraft = (data: FormValues) => handleCreate(data, "Draft");
  const onSubmitReview = (data: FormValues) => handleCreate(data, "Submit");

  return (
    <Box>
      <PageHeader
        title="New Document Request"
        subtitle="Initiate a new controlled document workflow"
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
          Document Information
        </Typography>

        <Box
          component="form"
          // We bind the primary submit to "Submit for Review"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Document Title"
                placeholder="e.g., Standard Operating Procedure for Cleaning..."
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="docType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Document Type"
                    fullWidth
                    error={!!errors.docType}
                    helperText={errors.docType?.message}
                  >
                    <MenuItem value="SOP">
                      SOP (Standard Operating Procedure)
                    </MenuItem>
                    <MenuItem value="WI">WI (Work Instruction)</MenuItem>
                    <MenuItem value="Policy">Policy</MenuItem>
                    <MenuItem value="Form">Form / Template</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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
                    helperText={errors.department?.message}
                  >
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner / Author"
                placeholder="Name of the person responsible"
                fullWidth
                {...register("owner")}
                error={!!errors.owner}
                helperText={errors.owner?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Scope & Description"
                placeholder="Describe the purpose of this document..."
                multiline
                rows={5}
                fullWidth
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Note: You will be able to upload attachments (Word/PDF) after saving
            the draft.
          </Typography>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{
              submit: "Create & Submit for Review",
              draft: "Save Draft",
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
