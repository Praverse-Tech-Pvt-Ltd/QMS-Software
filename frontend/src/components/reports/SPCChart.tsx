import { useEffect, useState } from "react";
import { Box, TextField, MenuItem, CircularProgress, Alert, Card, CardContent, Grid, Typography } from "@mui/material";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { reportsService, type SPCData, type SPCMetric } from "../../services/reports.service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const METRICS: { value: SPCMetric; label: string }[] = [
  { value: "deviation_rate", label: "Deviation Rate" },
  { value: "capa_cycle_time", label: "CAPA Cycle Time (days)" },
  { value: "oos_rate", label: "OOS Rate" },
  { value: "complaint_rate", label: "Complaint Rate" },
];

export default function SPCChart() {
  const [metric, setMetric] = useState<SPCMetric>("deviation_rate");
  const [months, setMonths] = useState(12);
  const [data, setData] = useState<SPCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    reportsService.getSPC(metric, months)
      .then(setData)
      .catch(() => setError("Failed to load SPC data."))
      .finally(() => setLoading(false));
  }, [metric, months]);

  const outOfControlCount = data ? data.values.filter((v) => v > data.ucl || v < data.lcl).length : 0;

  const chartData = data ? {
    labels: data.dates,
    datasets: [
      {
        label: METRICS.find((m) => m.value === metric)?.label,
        data: data.values,
        borderColor: "#667eea",
        backgroundColor: data.values.map((v) => (v > data.ucl || v < data.lcl ? "#EF4444" : "#667eea")),
        pointBackgroundColor: data.values.map((v) => (v > data.ucl || v < data.lcl ? "#EF4444" : "#667eea")),
        pointRadius: 4,
        tension: 0.2,
      },
      {
        label: "Mean",
        data: data.dates.map(() => data.mean),
        borderColor: "#10B981",
        borderDash: [6, 4],
        pointRadius: 0,
      },
      {
        label: "UCL",
        data: data.dates.map(() => data.ucl),
        borderColor: "#EF4444",
        borderDash: [6, 4],
        pointRadius: 0,
      },
      {
        label: "LCL",
        data: data.dates.map(() => data.lcl),
        borderColor: "#EF4444",
        borderDash: [6, 4],
        pointRadius: 0,
      },
    ],
  } : null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Metric" size="small" sx={{ minWidth: 220 }} value={metric}
          onChange={(e) => setMetric(e.target.value as SPCMetric)}>
          {METRICS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
        </TextField>
        <TextField select label="Months" size="small" sx={{ minWidth: 120 }} value={months}
          onChange={(e) => setMonths(Number(e.target.value))}>
          {[6, 12, 24].map((m) => <MenuItem key={m} value={m}>{m} months</MenuItem>)}
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : data && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Mean", value: data.mean, color: "#10B981" },
              { label: "UCL", value: data.ucl, color: "#EF4444" },
              { label: "LCL", value: data.lcl, color: "#EF4444" },
              { label: "Out-of-Control Points", value: outOfControlCount, color: outOfControlCount > 0 ? "#EF4444" : "#667eea" },
            ].map((k) => (
              <Grid size={{ xs: 6, sm: 3 }} key={k.label}>
                <Card sx={{ borderRadius: 2, border: `1px solid ${k.color}20`, textAlign: "center" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                    <Typography variant="h5" fontWeight={800} color={k.color}>{k.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {chartData && (
            <Box sx={{ maxWidth: 900 }}>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
