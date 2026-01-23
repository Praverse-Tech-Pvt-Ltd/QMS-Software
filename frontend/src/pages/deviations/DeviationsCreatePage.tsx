import { Box, Paper, TextField, MenuItem, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import SectionTabs from "../../components/qms/SectionTabs";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  // Basic
  title: z.string().min(3, "Title is required"),
  department: z.string().min(2, "Department is required"),
  reportedBy: z.string().min(2, "Reported By is required"),
  incidentDate: z.string().min(1, "Date of Incident is required"),
  severity: z.string().min(1, "Severity is required"),
  classification: z.string().min(1, "Classification is required"),
  description: z.string().min(5, "Description is required"),

  // Containment
  immediateAction: z.string().min(3, "Immediate action is required"),
  batchNo: z.string().min(1, "Batch No is required"),
  productName: z.string().min(2, "Product name is required"),
  impactedArea: z.string().min(2, "Impacted area is required"),

  // Investigation
  investigationSummary: z.string().min(3, "Investigation summary is required"),
  rootCause: z.string().min(3, "Root cause is required"),

  // CAPA Linkage
  capaRequired: z.string().min(1, "CAPA requirement must be selected"),
  linkedCapaId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function DeviationsCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      department: "Production",
      reportedBy: "",
      incidentDate: "",
      severity: "Medium",
      classification: "Process",
      description: "",

      immediateAction: "",
      batchNo: "",
      productName: "",
      impactedArea: "",

      investigationSummary: "",
      rootCause: "",

      capaRequired: "Yes",
      linkedCapaId: "",
    },
  });

  const capaRequiredValue = watch("capaRequired");

  const onSaveDraft = (data: FormValues) => {
    enqueueSnackbar("Deviation saved as Draft (mock)", { variant: "success" });
    navigate("/deviations");
  };

  const onSubmitReview = (data: FormValues) => {
    enqueueSnackbar("Deviation submitted for QA Review (mock)", {
      variant: "success",
    });
    navigate("/deviations");
  };

  return (
    <Box>
      <PageHeader
        title="Raise Deviation / Incident"
        subtitle="Pharma deviation form (UI only)"
        showBack
      />

      {/* Basic Information */}
      <Paper
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Basic Information
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitReview)}
          sx={{ display: "grid", gap: 2 }}
        >
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
            select
            label="Severity"
            {...register("severity")}
            error={!!errors.severity}
            helperText={errors.severity?.message}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </TextField>

          <TextField
            select
            label="Classification"
            {...register("classification")}
            error={!!errors.classification}
            helperText={errors.classification?.message}
          >
            <MenuItem value="Process">Process</MenuItem>
            <MenuItem value="Quality">Quality</MenuItem>
            <MenuItem value="Safety">Safety</MenuItem>
            <MenuItem value="Equipment">Equipment</MenuItem>
            <MenuItem value="Documentation">Documentation</MenuItem>
          </TextField>

          <TextField
            label="Deviation Description"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          {/* Tabs for Containment / Investigation / CAPA Linkage */}
          <SectionTabs
            tabs={[
              {
                label: "Containment",
                content: (
                  <Box sx={{ display: "grid", gap: 2 }}>
                    <TextField
                      label="Immediate Containment Action"
                      multiline
                      rows={3}
                      {...register("immediateAction")}
                      error={!!errors.immediateAction}
                      helperText={errors.immediateAction?.message}
                    />

                    <TextField
                      label="Product Name"
                      {...register("productName")}
                      error={!!errors.productName}
                      helperText={errors.productName?.message}
                    />

                    <TextField
                      label="Batch No."
                      {...register("batchNo")}
                      error={!!errors.batchNo}
                      helperText={errors.batchNo?.message}
                    />

                    <TextField
                      label="Impacted Area"
                      {...register("impactedArea")}
                      error={!!errors.impactedArea}
                      helperText={errors.impactedArea?.message}
                    />
                  </Box>
                ),
              },
              {
                label: "Investigation",
                content: (
                  <Box sx={{ display: "grid", gap: 2 }}>
                    <TextField
                      label="Investigation Summary"
                      multiline
                      rows={3}
                      {...register("investigationSummary")}
                      error={!!errors.investigationSummary}
                      helperText={errors.investigationSummary?.message}
                    />

                    <TextField
                      label="Root Cause"
                      multiline
                      rows={3}
                      {...register("rootCause")}
                      error={!!errors.rootCause}
                      helperText={errors.rootCause?.message}
                    />
                  </Box>
                ),
              },
              {
                label: "CAPA Linkage",
                content: (
                  <Box sx={{ display: "grid", gap: 2 }}>
                    <TextField
                      select
                      label="CAPA Required?"
                      {...register("capaRequired")}
                      error={!!errors.capaRequired}
                      helperText={errors.capaRequired?.message}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>

                    <TextField
                      label="Linked CAPA ID (optional)"
                      {...register("linkedCapaId")}
                      disabled={capaRequiredValue === "No"}
                      placeholder="CAPA-0004"
                    />
                  </Box>
                ),
              },
            ]}
          />

          <FormActions onSaveDraft={handleSubmit(onSaveDraft)} />
        </Box>
      </Paper>
    </Box>
  );
}
