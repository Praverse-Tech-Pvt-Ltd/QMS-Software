import { Box, Paper, TextField } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../components/common/FormActions";

const schema = z.object({
  title: z.string().min(3, "Change title is required"),
  department: z.string().min(2, "Department is required"),
  owner: z.string().min(2, "Owner is required"),
  implementationDate: z.string().min(1, "Implementation date is required"),
  reason: z.string().min(5, "Reason for change is required"),
  description: z.string().min(5, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ChangeControlCreatePage() {
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
      implementationDate: "",
      reason: "",
      description: "",
    },
  });

  const onSaveDraft = (data: FormValues) => {
    enqueueSnackbar("Change Control saved as Draft (mock)", { variant: "success" });
    navigate("/change-control");
  };

  const onSubmitReview = (data: FormValues) => {
    enqueueSnackbar("Change Control submitted for QA Review (mock)", { variant: "success" });
    navigate("/change-control");
  };

  return (
    <Box>
      <PageHeader
        title="Initiate Change Control"
        subtitle="Change Control record creation (UI only)"
        showBack
      />

      <Paper sx={{ mt: 2, p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmitReview)} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Change Title"
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
            label="Planned Implementation Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("implementationDate")}
            error={!!errors.implementationDate}
            helperText={errors.implementationDate?.message}
          />

          <TextField
            label="Reason for Change"
            multiline
            rows={2}
            {...register("reason")}
            error={!!errors.reason}
            helperText={errors.reason?.message}
          />

          <TextField
            label="Change Description"
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
