import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Stack,
  Alert,
  AlertTitle,
  Grid,
} from "@mui/material";

// ✅ Grid v2 Import

import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useNavigate } from "react-router-dom";
import { motion, transitions, shadows, keyframes } from "../../theme/motion";
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
  batchNo: z.string().optional(),
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      department: "Production",
      reportedBy: "", 
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

  // Reusable Create Logic
  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // 1. Generate ID (Mock)
      const newId = `DEV-2024-${Math.floor(Math.random() * 1000)}`;
      
      // ✅ FIX: Use variables to resolve unused warnings
      const initialStatus = action === "Draft" ? "Draft" : "Investigation"; 
      console.log(`Creating Deviation (${initialStatus}):`, data);

      // 2. Persist Data
      workflowService.getOrCreate(newId, "deviations");

      // 3. Log Audit
      auditService.add("deviations", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        // ✅ FIX: Handle nullable role
        role: role || "Unknown",
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
    <Box 
      sx={{ 
        animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
        ...keyframes.fadeInUp,
      }}
    >
      <PageHeader
        title="Raise Deviation / Incident"
        subtitle="Report a quality event or non-conformance"
        showBack
      />

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2.5,
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 3,
          border: "1px solid #fecaca",
          bgcolor: "#fef2f2",
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <WarningAmberIcon sx={{ color: "#ef4444", mt: 0.5 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
            Report Quality Events Promptly
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "14px" }}>
            All deviations must be reported within 24 hours of discovery. Complete all required fields accurately.
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
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReportProblemOutlinedIcon sx={{ color: "#DC2626", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Event Report
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Required fields are marked with *
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 3 }}
        >
          {/* Basic Information Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Short Description / Title *"
                placeholder="e.g. Temperature Excursion in Warehouse B"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message || "Provide a clear, concise description"}
                InputProps={{
                  startAdornment: (
                    <PersonOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    transition: transitions.fast,
                    "&.Mui-focused": {
                      boxShadow: shadows.subtle,
                    },
                  },
                }}
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
                    label="Department *"
                    fullWidth
                    error={!!errors.department}
                    InputProps={{
                      startAdornment: (
                        <BusinessOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#FFFFFF",
                        transition: transitions.fast,
                        "&.Mui-focused": {
                          boxShadow: shadows.subtle,
                        },
                      },
                    }}
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
                label="Date of Incident *"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("incidentDate")}
                error={!!errors.incidentDate}
                helperText={errors.incidentDate?.message}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 18 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    transition: transitions.fast,
                    "&.Mui-focused": {
                      boxShadow: shadows.subtle,
                    },
                  },
                }}
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