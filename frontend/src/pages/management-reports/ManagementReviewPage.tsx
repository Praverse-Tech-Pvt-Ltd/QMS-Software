import { Box, Typography, Grid, CircularProgress, Alert, Card, CardContent, Button, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useEffect, useState } from "react";
import { reportsService, type ManagementReviewKPIs } from "../../services/reports.service";

interface KPICardProps {
  title: string;
  total: number;
  open?: number;
  overdue?: number;
  color: string;
}

function KPICard({ title, total, open, overdue, color }: KPICardProps) {
  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${color}30`, height: "100%" }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={800} color={color} sx={{ my: 1 }}>{total}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {open !== undefined && (
            <Chip label={`${open} Open`} size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontSize: "0.7rem" }} />
          )}
          {overdue !== undefined && overdue > 0 && (
            <Chip label={`${overdue} Overdue`} size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontSize: "0.7rem" }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ManagementReviewPage() {
  const [kpis, setKPIs] = useState<ManagementReviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportsService.getManagementReview()
      .then(setKPIs)
      .catch(() => setError("Failed to load management review data."))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const blob = await reportsService.exportManagementReview(String(new Date().getFullYear()));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "management-review.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Management Review Dashboard</Typography>
          {kpis && (
            <Typography variant="body2" color="text.secondary">
              Period: {kpis.period_start} – {kpis.period_end}
            </Typography>
          )}
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export PDF
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : kpis ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="Deviations" total={kpis.deviations.total} open={kpis.deviations.open} overdue={kpis.deviations.overdue} color="#667eea" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="CAPAs" total={kpis.capas.total} open={kpis.capas.open} overdue={kpis.capas.overdue} color="#10B981" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="Complaints" total={kpis.complaints.total} open={kpis.complaints.critical} overdue={kpis.complaints.overdue} color="#EF4444" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="Audits" total={kpis.audits.total} open={kpis.audits.open_findings} overdue={kpis.audits.critical_findings} color="#F59E0B" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="Risks (Critical/High)" total={kpis.risks.total} open={kpis.risks.critical} overdue={kpis.risks.high} color="#8B5CF6" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KPICard title="Training Compliance" total={kpis.training.total_assignments} overdue={kpis.training.overdue} color="#06B6D4" />
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
