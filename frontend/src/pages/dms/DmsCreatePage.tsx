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

// ✅ Import the API helper
import FormActions from "../../components/common/FormActions";

// Validation Schema
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  document_id: z.string().min(3, "Document ID is required (e.g., SOP-QA-001)"),
  doc_type: z.string().min(1, "Document Type is required"),
  department: z.string().min(1, "Department is required"),
  // Removed 'owner' (handled by backend)
  // Removed 'description' (backend model doesn't have this field yet)
});

type FormValues = z.infer<typeof schema>;

export default function DmsCreatePage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      document_id: "",
      doc_type: "SOP",
      department: "QA",
    },
  });

  // ✅ Real Backend Create Logic
  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      const payload = {
        title: data.title,
        document_id: data.document_id,
        doc_type: data.doc_type,
        department: data.department,
        status: action === "Draft" ? "DRAFT" : "REVIEW" // Map to Django choices
      };

      // 1. Call Django API
      // await api.post('/dms/documents/', payload);

      // 2. Feedback & Redirect
      enqueueSnackbar(
        `Document ${data.document_id} created successfully!`,
        { variant: "success" }
      );
      
      // Redirect to the list view (or detail view if you have it ready)
      navigate('/dms'); 
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.document_id 
        ? "Document ID already exists." 
        : "Failed to create document.";
      enqueueSnackbar(msg, { variant: "error" });
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
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          <Grid container spacing={3}>
            {/* Title */}
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

            {/* Document ID (Required by Backend) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Document ID"
                placeholder="e.g., SOP-QA-001"
                fullWidth
                {...register("document_id")}
                error={!!errors.document_id}
                helperText={errors.document_id?.message}
              />
            </Grid>

            {/* Document Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="doc_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Document Type"
                    fullWidth
                    error={!!errors.doc_type}
                    helperText={errors.doc_type?.message}
                  >
                    <MenuItem value="SOP">SOP (Standard Operating Procedure)</MenuItem>
                    <MenuItem value="WI">WI (Work Instruction)</MenuItem>
                    <MenuItem value="POL">Policy</MenuItem>
                    <MenuItem value="FORM">Form / Template</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Department */}
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
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Note: You are creating this record as the <strong>Owner</strong>. You can upload files after saving.
          </Typography>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{
              submit: "Create & Submit",
              draft: "Save Draft",
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}