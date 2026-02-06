import { Box, Paper, TextField, MenuItem, Typography, Divider,  Grid, Chip, Stack, Alert, AlertTitle } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

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
  title: z.string().min(5, "Training title must be descriptive"),
  trainingMethod: z.string().min(1, "Method is required"),
  assessmentType: z.string().min(1, "Assessment type is required"),
  department: z.string().min(1, "Target Department is required"),
  coordinator: z.string().min(2, "Coordinator/Trainer name is required"),
  dueDate: z.string().min(1, "Completion due date is required"),
  // z.coerce handles string "60" -> number 60 automatically
  durationMinutes: z.coerce.number().min(5, "Duration must be at least 5 mins"),
  description: z.string().min(10, "Learning objectives are required"),
});

// Infer type from schema
type FormValues = z.infer<typeof schema>;

export default function TrainingCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

  // ✅ Fix: Removed <FormValues> generic to allow resolver type inference
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      trainingMethod: "Classroom",
      assessmentType: "Quiz",
      department: "Production",
      coordinator: "",
      dueDate: "",
      durationMinutes: 60, // Default must match the coerced type (number)
      description: "",
    },
  });

  // Reusable Create Logic
  const handleCreate = async (data: FormValues, action: 'Draft' | 'Submit') => {
    try {
      const newId = `TRN-2024-${Math.floor(Math.random() * 1000)}`;
      
      workflowService.getOrCreate(newId, 'training');

      auditService.add('training', newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role,
        reason: `Created Training Plan (${action})`
      });

      enqueueSnackbar(`Training Plan ${newId} created successfully`, { variant: "success" });
      navigate(`/training/${newId}`);

    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to create training plan", { variant: "error" });
    }
  };

  const onSaveDraft = (data: FormValues) => handleCreate(data, 'Draft');
  const onSubmitReview = (data: FormValues) => handleCreate(data, 'Submit');

  return (
    <Box
      sx={{ 
        animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
        ...keyframes.fadeInUp,
      }}
    >
      <PageHeader
        title="Create Training Plan"
        subtitle="Configure a new training module or event"
        showBack
      />

      <Alert 
        severity="info" 
        icon={<InfoOutlinedIcon />}
        sx={{ 
          mt: 3, 
          maxWidth: 1200, 
          mx: "auto",
          borderRadius: 3,
          border: "1px solid #C7D2FE",
          bgcolor: "#F5F7FF",
        }}
      >
        <AlertTitle sx={{ fontWeight: 700 }}>Training Management</AlertTitle>
        Define the training requirements, select assessment methods, and assign completion deadlines.
      </Alert>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 5,
          borderRadius: 4,
          border: "1px solid #E9ECEF",
          boxShadow: shadows.card,
          maxWidth: 1200,
          mx: "auto",
          background: "linear-gradient(to bottom, #FFFFFF 0%, #FAFBFC 100%)",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolOutlinedIcon sx={{ color: "#2563EB", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Plan Configuration
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
          {/* Configuration Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Training Module Title *"
                placeholder="e.g. Annual Gowning & Hygiene Refresher"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message || "Describe the training topic clearly"}
                InputProps={{
                  startAdornment: (
                    <SchoolOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
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
                    label="Target Department"
                    fullWidth
                    error={!!errors.department}
                  >
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="All">All Departments</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="trainingMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Training Method"
                    fullWidth
                    error={!!errors.trainingMethod}
                  >
                    <MenuItem value="Read & Understand">Read & Understand (SOP)</MenuItem>
                    <MenuItem value="Classroom">Classroom / Instructor Led</MenuItem>
                    <MenuItem value="OJT">On-the-Job Training (OJT)</MenuItem>
                    <MenuItem value="E-Learning">E-Learning / SCORM</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="assessmentType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Assessment Type"
                    fullWidth
                    error={!!errors.assessmentType}
                  >
                    <MenuItem value="None">Attendance Only</MenuItem>
                    <MenuItem value="Quiz">Written Quiz</MenuItem>
                    <MenuItem value="Practical">Practical Demonstration</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Duration (Minutes)"
                type="number"
                fullWidth
                {...register("durationMinutes")}
                error={!!errors.durationMinutes}
                helperText={errors.durationMinutes?.message}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Logistics Section */}
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            Logistics & Objectives
          </Typography>

          <Grid container spacing={3}>
             <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Coordinator / Trainer"
                  fullWidth
                  placeholder="Who is managing this training?"
                  {...register("coordinator")}
                  error={!!errors.coordinator}
                  helperText={errors.coordinator?.message}
                />
             </Grid>

             <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Completion Deadline"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...register("dueDate")}
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                />
             </Grid>

             <Grid size={{ xs: 12 }}>
                <TextField
                  label="Learning Objectives / Description"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="What will trainees learn? e.g. Proper gowning sequence for Zone A entry..."
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
             </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />
          
          <Typography variant="body2" color="text.secondary">
             Note: You can assign specific employees and upload training materials after creating the plan.
          </Typography>

          <FormActions 
             onSaveDraft={() => handleSubmit(onSaveDraft)()} 
             isSubmitting={isSubmitting}
             labels={{ submit: "Create Plan", draft: "Save Draft" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}