import { Box, Paper, Typography, Grid, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';

interface Stats {
  pending: number;
  total: number;
}

export default function QualitySummaryWidget() {
  const [data, setData] = useState<{ [key: string]: Stats } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats/")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Open Deviations", key: "deviations", icon: <ReportProblemOutlinedIcon color="error" />, color: "#fee2e2" },
    { label: "Pending CAPAs", key: "capas", icon: <FactCheckOutlinedIcon color="warning" />, color: "#fef3c7" },
    { label: "Active Changes", key: "changes", icon: <PublishedWithChangesOutlinedIcon color="primary" />, color: "#e0e7ff" },
  ];

  if (loading) return <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, md: 4 }} key={card.key}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: card.color }}>
              {card.icon}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {data?.[card.key]?.pending || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {card.label}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Out of {data?.[card.key]?.total || 0} total
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}