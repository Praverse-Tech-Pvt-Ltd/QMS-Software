import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  changeService,
  type ChangeRecord,
} from "../../services/change.service";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  changeType: z.string().min(1, "Change Type is required"),
  department: z.string().min(1, "Department is required"),
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
      const payload: Partial<ChangeRecord> = {
        title: data.title,
        description: data.description,
        justification: data.justification,
        department: data.department,
        change_type: data.changeType as any,
        target_date: data.implementationDate,
        status: action === "Draft" ? "DRAFT" : "EVALUATION",
      };

      const res = await changeService.create(payload);
      enqueueSnackbar(`Change Control ${res.cc_id} initiated successfully`, {
        variant: "success",
      });
      navigate(`/change-control/${res.cc_id}`);
    } catch (err) {
      enqueueSnackbar("Failed to create record", { variant: "error" });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Initiate Change Control"
        subtitle="Formal request for process or system changes"
        showBack
      />

      <Paper
        sx={{
          mt: 3,
          p: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
          General Information
        </Typography>

        <Box component="form" sx={{ display: "grid", gap: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Change Title"
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
                  <TextField {...field} select label="Type" fullWidth>
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
                  <TextField {...field} select label="Department" fullWidth>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="QA">Quality Assurance</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Target Date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("implementationDate")}
                error={!!errors.implementationDate}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                {...register("description")}
                error={!!errors.description}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Justification"
                multiline
                rows={2}
                fullWidth
                {...register("justification")}
                error={!!errors.justification}
              />
            </Grid>
          </Grid>

          <FormActions
            onCancel={handleCancel}
            onSaveDraft={handleSubmit((d) => handleCreate(d, "Draft"))}
            onSubmit={handleSubmit((d) => handleCreate(d, "Submit"))}
            isSubmitting={isSubmitting}
            labels={{ submit: "Initiate Change Request", draft: "Save Draft" }}
          />
        </Box>
      </Paper>

      <ConfirmDialog
        open={showDiscardDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Leaving this page will delete all progress permanently."
        confirmText="Discard Changes"
        isDestructive={true} // ✅ Matches your component's prop name
        onClose={() => setShowDiscardDialog(false)}
        onConfirm={() => navigate("/change-control")}
      />
    </Box>
  );
}
