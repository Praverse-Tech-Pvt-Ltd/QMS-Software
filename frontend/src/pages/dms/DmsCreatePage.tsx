import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Stack,
  Chip,
  alpha,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// ✅ Use the Service, not direct API calls
import { dmsService } from "../../services/dms.service";
import FormActions from "../../components/common/FormActions";
import { keyframes, transitions } from "../../theme/motion";

// Validation Schema
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  document_id: z.string().min(3, "Document ID is required (e.g., SOP-QA-001)"),
  doc_type: z.string().min(1, "Document Type is required"),
  department: z.string().min(1, "Department is required"),
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

  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // ✅ Construct payload matching the Service Interface
      const payload: any = {
        title: data.title,
        document_id: data.document_id,
        doc_type: data.doc_type,
        department: data.department,
        status: action === "Draft" ? "DRAFT" : "REVIEW",
      };

      // ✅ Use Service
      await dmsService.create(payload);

      enqueueSnackbar(`Document ${data.document_id} created successfully!`, {
        variant: "success",
      });

      navigate("/dms");
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
    <Box
      sx={{
        animation: `fadeInUp 400ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        ...keyframes.fadeInUp,
      }}
    >
      <PageHeader
        title="Create New Document"
        subtitle="Initiate a new controlled document workflow"
        showBack
      />

      {/* Info Banner */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2.5,
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha("#3b82f6", 0.2),
          bgcolor: alpha("#3b82f6", 0.03),
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <InfoOutlinedIcon sx={{ color: "#3b82f6", mt: 0.5 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
            Document Control Process
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "14px" }}>
            All documents follow 21 CFR Part 11 compliance. Once submitted, they enter the approval workflow.
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 4,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          maxWidth: 1200,
          mx: "auto",
          bgcolor: "#ffffff",
        }}
      >
        {/* Section Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha("#3b82f6", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Document Information
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Provide basic details for the new document
            </Typography>
          </Box>
        </Stack>

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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fafbfc",
                    transition: transitions.fast,
                    "&:hover": {
                      bgcolor: "#ffffff",
                    },
                    "&.Mui-focused": {
                      bgcolor: "#ffffff",
                    },
                  },
                }}
              />
            </Grid>

            {/* Document ID */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Document ID"
                placeholder="e.g., SOP-QA-001"
                fullWidth
                {...register("document_id")}
                error={!!errors.document_id}
                helperText={errors.document_id?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fafbfc",
                    transition: transitions.fast,
                    "&:hover": {
                      bgcolor: "#ffffff",
                    },
                    "&.Mui-focused": {
                      bgcolor: "#ffffff",
                    },
                  },
                }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fafbfc",
                        transition: transitions.fast,
                        "&:hover": {
                          bgcolor: "#ffffff",
                        },
                        "&.Mui-focused": {
                          bgcolor: "#ffffff",
                        },
                      },
                    }}
                  >
                    <MenuItem value="SOP">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>📋</span>
                        <span>SOP (Standard Operating Procedure)</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="WI">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>📝</span>
                        <span>WI (Work Instruction)</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="POL">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>📜</span>
                        <span>Policy</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="FORM">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>📄</span>
                        <span>Form / Template</span>
                      </Stack>
                    </MenuItem>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fafbfc",
                        transition: transitions.fast,
                        "&:hover": {
                          bgcolor: "#ffffff",
                        },
                        "&.Mui-focused": {
                          bgcolor: "#ffffff",
                        },
                      },
                    }}
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

          {/* Note Section */}
          <Box
            sx={{
              mt: 2,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Chip
                label="NOTE"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "11px",
                  fontWeight: 700,
                  bgcolor: "#3b82f6",
                  color: "white",
                }}
              />
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, pt: 0.25 }}>
                You are creating this record as the <strong>Owner</strong>. Files can be uploaded after saving the document.
              </Typography>
            </Stack>
          </Box>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            isSubmitting={isSubmitting}
            labels={{
              submit: "Create & Submit for Review",
              draft: "Save as Draft",
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}