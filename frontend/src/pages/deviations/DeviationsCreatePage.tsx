import { Box, Paper, TextField } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../components/common/FormActions";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  department: z.string().min(2, "Department is required"),
  reportedBy: z.string().min(2, "Reported By is required"),
  incidentDate: z.string().min(1, "Date of Incident is required"),
  description: z.string().min(5, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

export default function DeviationsCreatePage() {
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
      department: "Production",
      reportedBy: "",
      incidentDate: "",
      description: "",
    },
  });

  const onSaveDraft = (data: FormValues) => {
    enqueueSnackbar("Deviation saved as Draft (mock)", { variant: "success" });
    navigate("/deviations");
  };

  const onSubmitReview = (data: FormValues) => {
    enqueueSnackbar("Deviation submitted for Review (mock)", { variant: "success" });
    navigate("/deviations");
  };

  return (
    <Box>
      <PageHeader
        title="Raise Deviation / Incident"
        subtitle="Deviation record creation (UI only)"
        showBack
      />

      <Paper sx={{ mt: 2, p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmitReview)} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Title"
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
            label="Reported By"
            {...register("reportedBy")}
            error={!!errors.reportedBy}
            helperText={errors.reportedBy?.message}
          />

          <TextField
            label="Date of Incident"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("incidentDate")}
            error={!!errors.incidentDate}
            helperText={errors.incidentDate?.message}
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
