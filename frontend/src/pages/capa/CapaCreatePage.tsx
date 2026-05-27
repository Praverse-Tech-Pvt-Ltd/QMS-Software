import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Chip,
  Stack,
  Alert,
   Grid, // ✅ Standardized Grid Import
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { useNavigate } from "react-router-dom";
import { motion, transitions, shadows, keyframes } from "../../theme/motion";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRole } from "../../app/providers/RoleProvider";
import { workflowService } from "../../services/workflow.service";
import { auditService } from "../../services/audit.service";

const schema = z.object({
  title: z.string().min(5, "Title must be descriptive"),
  sourceType: z.string().min(1, "Source is required"),
  sourceReference: z.string().optional(),
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

  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      const newId = `CAPA-2024-${Math.floor(Math.random() * 1000)}`;

      // Simulate API call
      console.log(`Submitting CAPA Data (${action}):`, data);
      
      workflowService.getOrCreate(newId, "capa");

      auditService.add("capa", newId, {
        actionType: "CREATE",
        field: "Record",
        oldValue: "N/A",
        newValue: "Created",
        user: "Current User",
        role: role || "Unknown", 
        reason: `CAPA Initiated (${action})`,
      });

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
    <Box
      sx={{ 
        animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
        ...keyframes.fadeInUp,
      }}
    >
      <PageHeader
        title="Initiate CAPA"
        subtitle="Corrective and Preventive Action Request"
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
          border: "1px solid #fde68a",
          bgcolor: "#fef3c7",
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <InfoOutlinedIcon sx={{ color: "#f59e0b", mt: 0.5 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
            CAPA Investigation Process
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "14px" }}>
            Define the problem statement, identify root causes, and establish corrective/preventive actions.
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
                bgcolor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FactCheckOutlinedIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                CAPA Initiation Form
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
          {/* Source & Classification */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="CAPA Title / Short Description *"
                placeholder="e.g. Labeling Error on Line 4 packaging"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message || "Provide a clear problem summary"}
                slotProps={{
                  input: {
                    startAdornment: (
                      <FactCheckOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                    ),
                  }
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
                    label="Responsible Department *"
                    fullWidth
                    error={!!errors.department}
                    helperText={errors.department?.message || "Owning department"}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <BusinessOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                            ),
                        }
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
                    label="Source of CAPA *"
                    fullWidth
                    error={!!errors.sourceType}
                    helperText={errors.sourceType?.message || "Origin/trigger for CAPA"}
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
                    <MenuItem value="Deviation">
                      <Chip label="Deviation / Incident" size="small" color="error" sx={{ fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="Internal Audit">
                      <Chip label="Internal Audit" size="small" color="info" sx={{ fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="External Audit">
                      <Chip label="Regulatory / External Audit" size="small" color="warning" sx={{ fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="Complaint">
                      <Chip label="Customer Complaint" size="small" color="secondary" sx={{ fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="OOS">
                      <Chip label="Out of Specification (OOS)" size="small" color="error" sx={{ fontSize: 12 }} />
                    </MenuItem>
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
                helperText={errors.sourceReference?.message || "Link to originating record"}
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
                name="riskLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Initial Risk Assessment *"
                    fullWidth
                    error={!!errors.riskLevel}
                    helperText={errors.riskLevel?.message || "Impact severity"}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <PriorityHighIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                            ),
                        }
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
                    <MenuItem value="Critical">
                      <Chip label="Critical" size="small" sx={{ bgcolor: "#DC2626", color: "white", fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="High">
                      <Chip label="High" size="small" sx={{ bgcolor: "#F59E0B", color: "white", fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="Medium">
                      <Chip label="Medium" size="small" sx={{ bgcolor: "#3B82F6", color: "white", fontSize: 12 }} />
                    </MenuItem>
                    <MenuItem value="Low">
                      <Chip label="Low" size="small" sx={{ bgcolor: "#10B981", color: "white", fontSize: 12 }} />
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          {/* Problem Details */}
          <Box sx={{ mb: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
              Problem Definition
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Describe the issue requiring corrective/preventive action
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Problem Statement *"
                multiline
                rows={4}
                fullWidth
                placeholder="Describe the non-conformance clearly. What happened? What is the impact?"
                {...register("problemStatement")}
                error={!!errors.problemStatement}
                helperText={errors.problemStatement?.message || "Clearly state the problem and its business impact"}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="CAPA Owner *"
                fullWidth
                placeholder="Assign a responsible person"
                {...register("owner")}
                error={!!errors.owner}
                helperText={errors.owner?.message || "Lead investigator"}
                slotProps={{
                    input: {
                        startAdornment: (
                            <PersonOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
                        ),
                    }
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Target Closure Date *"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("targetDate")}
                error={!!errors.targetDate}
                helperText={errors.targetDate?.message || "Expected completion"}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />
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
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Alert 
            severity="warning" 
            icon={<InfoOutlinedIcon />}
            sx={{ 
              borderRadius: 3, 
              bgcolor: "#FEF3C7",
              border: "1px solid #FDE68A",
              "& .MuiAlert-icon": { color: "#F59E0B" },
            }}
          >
            <Typography variant="body2" sx={{ color: "#92400E", fontWeight: 600 }}>
              Root Cause Analysis (RCA) and Action Plan definition will occur in the Investigation phase.
            </Typography>
          </Alert>

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