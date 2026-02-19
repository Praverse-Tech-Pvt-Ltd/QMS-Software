import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
   Grid, // ✅ Standardized Grid2
  Stack,
  alpha,
  Button,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import { dmsService } from "../../services/dms.service";
import { keyframes, transitions } from "../../theme/motion";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  document_id: z.string().min(3, "Document ID is required (e.g., SOP-QA-001)"),
  doc_type: z.string().min(1, "Document Type is required"),
  department: z.string().min(1, "Department is required"),
});

type FormValues = z.infer<typeof schema>;

const Divider = ({ sx }: { sx?: any }) => (
  <Box sx={{ width: "100%", height: "1px", bgcolor: "#e2e8f0", ...sx }} />
);

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
      const payload = {
        ...data,
        status: action === "Draft" ? "DRAFT" : "REVIEW",
      };

      await dmsService.create(payload as any);

      enqueueSnackbar(`Document ${data.document_id} created as ${action}!`, {
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

  return (
    <Box
      sx={{
        animation: `fadeInUp 400ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        ...keyframes.fadeInUp,
        p: 3,
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
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha("#4f46e5", 0.2),
          bgcolor: alpha("#4f46e5", 0.02),
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <InfoOutlinedIcon sx={{ color: "#4f46e5", mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e1b4b", mb: 0.5 }}>
            Regulatory Compliance Reminder
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
            All documents must adhere to <b>21 CFR Part 11</b>. Submitting a document initiates 
            a formal audit trail. Ensure all metadata is accurate before routing for review.
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          maxWidth: 1200,
          mx: "auto",
          bgcolor: "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: alpha("#4f46e5", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4f46e5",
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Metadata Configuration
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
              Primary identification details for the controlled document
            </Typography>
          </Box>
        </Stack>

        <form onSubmit={handleSubmit((data) => handleCreate(data, "Submit"))}>
          <Grid container spacing={4}>
            {/* Title */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Document Title"
                placeholder="e.g., Cleaning Validation for Aseptic Area"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    borderRadius: 3,
                    transition: transitions.fast,
                    "&:hover": { bgcolor: "#ffffff" },
                  },
                }}
              />
            </Grid>

            {/* Document ID */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Document ID"
                placeholder="SOP-QA-001"
                fullWidth
                {...register("document_id")}
                error={!!errors.document_id}
                helperText={errors.document_id?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    borderRadius: 3,
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
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
                  >
                    <MenuItem value="SOP">SOP - Standard Operating Procedure</MenuItem>
                    <MenuItem value="WI">WI - Work Instruction</MenuItem>
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
                    label="Owning Department"
                    fullWidth
                    error={!!errors.department}
                    helperText={errors.department?.message}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 3 } }}
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

            {/* Form Actions */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2, opacity: 0.6 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={handleSubmit((data) => handleCreate(data, "Draft"))}
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, color: "#475569", borderColor: "#e2e8f0" }}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendOutlinedIcon />}
                  disabled={isSubmitting}
                  sx={{ 
                    borderRadius: 2.5, 
                    px: 4, 
                    fontWeight: 700, 
                    bgcolor: "#4f46e5",
                    boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.3)" 
                  }}
                >
                  Submit for Review
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}