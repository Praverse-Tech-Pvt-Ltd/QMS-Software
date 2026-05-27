import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  changeService,
  type ChangeRecord,
} from "../../services/change.service";

const schema = z.object({
  title: z.string().min(5, "Title is required (min 5 chars)"),
  changeType: z.enum(["STANDARD", "PERMANENT", "TEMPORARY", "EMERGENCY"]),
  department: z.string().min(1, "Department is required"),
  implementationDate: z
    .string()
    .min(1, "Target implementation date is required"),
  description: z.string().min(10, "Description must be detailed"),
  justification: z.string().min(10, "Justification is required for compliance"),
});

type FormValues = z.infer<typeof schema>;

export default function ChangeControlCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      changeType: "STANDARD",
      department: "Engineering",
      implementationDate: "",
      description: "",
      justification: "",
    },
  });

  const handleCancel = () => {
    if (isDirty) setShowDiscardDialog(true);
    else navigate("/change-control");
  };

  const handleCreate = async (data: FormValues, action: "Draft" | "Submit") => {
    try {
      // ✅ Handshake: Map form values to the snake_case Backend interface
      const payload: Partial<ChangeRecord> = {
        title: data.title,
        description: data.description,
        justification: data.justification,
        department: data.department,
        change_type: data.changeType,
        target_date: data.implementationDate,
        status: action === "Draft" ? "DRAFT" : "EVALUATION",
      };

      const res = await changeService.create(payload);
      enqueueSnackbar(`Change Control ${res.cc_id} initiated successfully`, {
        variant: "success",
      });
      navigate(`/change-control/${res.cc_id}`);
    } catch (err) {
      enqueueSnackbar("Validation failed. Please check required fields.", {
        variant: "error",
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Initiate Change Control"
        subtitle="Formalize requests for process, equipment, or system modifications"
        showBack
      />

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{
          mt: 3,
          maxWidth: 1000,
          mx: "auto",
          borderRadius: 2,
          fontWeight: 500,
        }}
      >
        Once initiated, this request will move to the{" "}
        <strong>Evaluation</strong> phase where impact assessments are required
        before QA approval.
      </Alert>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 4,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, mb: 3, color: "primary.main" }}
        >
          General Information
        </Typography>

        <Box component="form" sx={{ display: "grid", gap: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Change Title"
                placeholder="e.g., Replacement of HPLC Column in Lab 3"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
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
                    label="Change Classification"
                    fullWidth
                  >
                    <MenuItem value="STANDARD">Standard</MenuItem>
                    <MenuItem value="PERMANENT">Permanent</MenuItem>
                    <MenuItem value="TEMPORARY">Temporary</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency</MenuItem>
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
                    label="Requesting Department"
                    fullWidth
                  >
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                    <MenuItem value="QC">Quality Control</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Description"
                placeholder="Explain the technical details of the proposed change..."
                multiline
                rows={4}
                fullWidth
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Business & Quality Justification"
                placeholder="Why is this change necessary? (e.g., regulatory requirement, efficiency gain)"
                multiline
                rows={3}
                fullWidth
                {...register("justification")}
                error={!!errors.justification}
                helperText={errors.justification?.message}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <FormActions
              onCancel={handleCancel}
              onSaveDraft={handleSubmit((d) => handleCreate(d, "Draft"))}
              onSubmit={handleSubmit((d) => handleCreate(d, "Submit"))}
              isSubmitting={isSubmitting}
              labels={{ submit: "Submit for Evaluation", draft: "Save Draft" }}
            />
          </Box>
        </Box>
      </Paper>

      <ConfirmDialog
        open={showDiscardDialog}
        title="Discard Request?"
        message="You have unsaved information in this Change Control request. If you leave now, all data will be lost."
        confirmText="Discard Changes"
        isDestructive={true}
        onClose={() => setShowDiscardDialog(false)}
        onConfirm={() => navigate("/change-control")}
      />
    </Box>
  );
}
