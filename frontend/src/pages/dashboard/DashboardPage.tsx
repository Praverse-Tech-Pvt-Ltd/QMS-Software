import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard.service";
import KpiCard from "../../components/common/KpiCard";
import QuickActions from "../../components/dashboard/QuickActions";
import MyTasksWidget from "../../components/dashboard/MyTasksWidget";

type KPI = { label: string; value: number };

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    dashboardService.getKPIs().then(setKpis);
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>
        Home Dashboard
      </Typography>

      {/* ✅ KPI Responsive Grid without MUI Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
        }}
      >
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </Box>

      <Box sx={{ mt: 2.5, display: "grid", gap: 2.5 }}>
        <QuickActions />
        <MyTasksWidget />
      </Box>
    </Box>
  );
}
