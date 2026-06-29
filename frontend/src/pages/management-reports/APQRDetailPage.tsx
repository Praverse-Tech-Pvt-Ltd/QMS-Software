import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, Grid, Divider, IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { reportsService, type APQRReport } from "../../services/reports.service";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#FEF3C7", color: "#92400E" },
  under_review: { bg: "#EEF2FF", color: "#667eea" },
  approved: { bg: "#D1FAE5", color: "#065F46" },
};

export default function APQRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<APQRReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    reportsService.getAPQR(id)
      .then(setReport)
      .catch(() => setError("Failed to load APQR report."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    try {
      const blob = await reportsService.exportAPQR(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `APQR-${report?.product_code || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. The APQR content may not be generated yet.");
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!report) return null;

  const statusStyle = STATUS_COLORS[report.status] || { bg: "#F3F4F6", color: "#374151" };
  const content = ((report as unknown as Record<string, unknown>).content as Record<string, unknown>) || {};

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/management-review")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            APQR — {report.product_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Period: {report.period_start} to {report.period_end}
          </Typography>
        </Box>
        <Chip label={report.status.replace(/_/g, " ")}
          sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700, textTransform: "capitalize" }} />
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            {[
              { label: "Total Batches", value: report.batch_count || 0, color: "#667eea" },
              { label: "OOS Investigations", value: report.oos_count || 0, color: "#EF4444" },
              { label: "Period", value: `${new Date(report.period_start).getFullYear()}`, color: "#10B981" },
            ].map((k) => (
              <Grid size={{ xs: 12, sm: 4 }} key={k.label}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${k.color}20`, textAlign: "center" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                    <Typography variant="h4" fontWeight={800} color={k.color}>{k.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Report Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Report Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: "Product Name", value: report.product_name },
                { label: "Product Code", value: report.product_code },
                { label: "Period Start", value: report.period_start },
                { label: "Period End", value: report.period_end },
                { label: "Status", value: report.status },
                { label: "Generated", value: new Date(report.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: "flex", mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>{label}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ textTransform: "capitalize" }}>{value || "—"}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>APQR Sections</Typography>
              {[
                "Batch Summary", "OOS/OOT Summary", "Stability Summary",
                "CAPA Summary", "Change Control Summary", "Complaint Summary",
              ].map((section) => (
                <Box key={section} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: content[section.toLowerCase().replace(/ /g, "_")] ? "#10B981" : "#D1D5DB" }} />
                  <Typography variant="body2">{section}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* AI-generated content sections */}
        {Object.entries(content).map(([key, value]) => (
          typeof value === "string" && value.length > 20 && (
            <Grid size={{ xs: 12 }} key={key}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        ))}
      </Grid>
    </Box>
  );
}
