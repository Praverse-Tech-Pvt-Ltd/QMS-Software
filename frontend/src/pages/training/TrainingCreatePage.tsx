import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Stack,
  Grid,
} from "@mui/material";

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

import { useRole } from "../../app/providers/RoleProvider";
import { auditService } from "../../services/audit.service";
import {
  trainingService,
  type TrainingPlan,
} from "../../services/training.service";

// Define valid statuses to match your Workflow types

const schema = z.object({
  title: z.string().min(5, "Training title must be descriptive"),
  trainingMethod: z.string().min(1, "Method is required"),
  assessmentType: z.string().min(1, "Assessment type is required"),
  department: z.string().min(1, "Target Department is required"),
  coordinator: z.string().min(2, "Coordinator/Trainer name is required"),
  dueDate: z.string().min(1, "Completion due date is required"),
  durationMinutes: z.coerce.number().min(5, "Duration must be at least 5 mins"),
  description: z.string().min(10, "Learning objectives are required"),
});

type FormValues = z.infer<typeof schema>;

export default function TrainingCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { role } = useRole();

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
      durationMinutes: 60,
      description: "",
    },
  });

  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // ✅ Payload mapping with explicit type casting for Status
      // This solves the "string is not assignable to WorkflowStatus" error
      const payload: Partial<TrainingPlan> = {
        title: data.title,
        method: data.trainingMethod,
        department: data.department,
        trainer: data.coordinator,
        due_date: data.dueDate,
        duration_minutes: data.durationMinutes,
        description: data.description,
        // ✅ Type cast to any or specifically to TrainingStatus to satisfy TypeScript
        status: (action === "Draft" ? "DRAFT" : "ACTIVE") as any,
      };

      const response = await trainingService.create(payload);
      const serverId = response.id;

      // Log the event in the Audit Trail for 21 CFR Part 11 compliance
      auditService.add("training", serverId.toString(), {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role || "Unknown",
        reason: `Created Training Plan: ${data.title} (${action})`,
      });

      enqueueSnackbar(`Training Plan PLAN-${serverId} created successfully`, {
        variant: "success",
      });

      // ✅ Redirect using the format the DetailPage expects
      navigate(`/training/PLAN-${serverId}`);
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail || "Failed to create training plan";
      enqueueSnackbar(errorMsg, { variant: "error" });
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
        title="Create Training Plan"
        subtitle="Configure a new training module or event"
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
          border: "1px solid #bbf7d0",
          bgcolor: "#f0fdf4",
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <InfoOutlinedIcon sx={{ color: "#10b981", mt: 0.5 }} />
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}
          >
            Training Management
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontSize: "14px" }}
          >
            Define the training requirements, select assessment methods, and
            assign completion deadlines.
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
                bgcolor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolOutlinedIcon sx={{ color: "#2563EB", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Plan Configuration
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Required fields are marked with *
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box component="form" sx={{ display: "grid", gap: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Training Module Title *"
                placeholder="e.g. Annual Gowning & Hygiene Refresher"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={
                  errors.title?.message || "Describe the training topic clearly"
                }
                InputProps={{
                  startAdornment: (
                    <SchoolOutlinedIcon
                      sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    transition: transitions.fast,
                    "&.Mui-focused": { boxShadow: shadows.subtle },
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
                    InputProps={{
                      startAdornment: (
                        <BusinessOutlinedIcon
                          sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }}
                        />
                      ),
                    }}
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
                    <MenuItem value="Read & Understand">
                      Read & Understand (SOP)
                    </MenuItem>
                    <MenuItem value="Classroom">
                      Classroom / Instructor Led
                    </MenuItem>
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
                    <MenuItem value="Practical">
                      Practical Demonstration
                    </MenuItem>
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
                InputProps={{
                  startAdornment: (
                    <AccessTimeIcon
                      sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Divider />

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
                InputProps={{
                  startAdornment: (
                    <PersonOutlinedIcon
                      sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
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
                InputProps={{
                  startAdornment: (
                    <CalendarTodayOutlinedIcon
                      sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
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
            Note: You can assign specific employees and upload training
            materials after creating the plan.
          </Typography>

          <FormActions
            onSaveDraft={handleSubmit(onSaveDraft)}
            onSubmit={handleSubmit(onSubmitReview)} 
            isSubmitting={isSubmitting}
            labels={{ submit: "Create Plan", draft: "Save Draft" }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
