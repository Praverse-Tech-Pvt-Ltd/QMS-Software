import { Box, Paper, TextField } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../components/common/FormActions";

const schema = z.object({
  title: z.string().min(3, "Training title is required"),
  department: z.string().min(2, "Department is required"),
  owner: z.string().min(2, "Trainer/Owner is required"),
  effectiveDate: z.string().min(1, "Effective Date is required"),
  description: z.string().min(5, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

export default function TrainingCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      department: "QA",
      owner: "",
      effectiveDate: "",
      description: "",
    },
  });

  const onSaveDraft = (data: FormValues) => {
    enqueueSnackbar("Training saved as Draft (mock)", { variant: "success" });
    navigate("/training");
  };

  const onSubmitReview = (data: FormValues) => {
    enqueueSnackbar("Training submitted for Review (mock)", { variant: "success" });
    navigate("/training");
  };

  return (
    <Box>
      <PageHeader
        title="Create Training"
        subtitle="Training / LMS record creation (UI only)"
        showBack
      />

      <Paper sx={{ mt: 2, p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmitReview)} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Training Title"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Department"
            {...register("department")}
            error={!!errors.department}
            helperText={errors.department?.message}
          />

          <TextField
            label="Trainer / Owner"
            {...register("owner")}
            error={!!errors.owner}
            helperText={errors.owner?.message}
          />

          <TextField
            label="Effective Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("effectiveDate")}
            error={!!errors.effectiveDate}
            helperText={errors.effectiveDate?.message}
          />

          <TextField
            label="Description"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <FormActions onSaveDraft={handleSubmit(onSaveDraft)} />
        </Box>
      </Paper>
    </Box>
  );
}
