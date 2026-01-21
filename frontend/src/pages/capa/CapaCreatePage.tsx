import { Box, Paper, TextField } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../components/common/FormActions";

const schema = z.object({
  title: z.string().min(3, "CAPA title is required"),
  department: z.string().min(2, "Department is required"),
  owner: z.string().min(2, "Owner is required"),
  targetDate: z.string().min(1, "Target closure date is required"),
  rootCause: z.string().min(5, "Root cause is required"),
  actionPlan: z.string().min(5, "Corrective/Preventive action is required"),
});

type FormValues = z.infer<typeof schema>;

export default function CapaCreatePage() {
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
      targetDate: "",
      rootCause: "",
      actionPlan: "",
    },
  });

  const onSaveDraft = (data: FormValues) => {
    enqueueSnackbar("CAPA saved as Draft (mock)", { variant: "success" });
    navigate("/capa");
  };

  const onSubmitReview = (data: FormValues) => {
    enqueueSnackbar("CAPA submitted for Review (mock)", { variant: "success" });
    navigate("/capa");
  };

  return (
    <Box>
      <PageHeader
        title="Create CAPA"
        subtitle="CAPA record creation (UI only)"
        showBack
      />

      <Paper sx={{ mt: 2, p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmitReview)} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="CAPA Title"
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
            label="Owner"
            {...register("owner")}
            error={!!errors.owner}
            helperText={errors.owner?.message}
          />

          <TextField
            label="Target Closure Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("targetDate")}
            error={!!errors.targetDate}
            helperText={errors.targetDate?.message}
          />

          <TextField
            label="Root Cause"
            multiline
            rows={2}
            {...register("rootCause")}
            error={!!errors.rootCause}
            helperText={errors.rootCause?.message}
          />

          <TextField
            label="Corrective / Preventive Action"
            multiline
            rows={4}
            {...register("actionPlan")}
            error={!!errors.actionPlan}
            helperText={errors.actionPlan?.message}
          />

          <FormActions onSaveDraft={handleSubmit(onSaveDraft)} />
        </Box>
      </Paper>
    </Box>
  );
}
