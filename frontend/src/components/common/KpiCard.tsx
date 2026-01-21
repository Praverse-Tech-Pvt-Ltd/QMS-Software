import { Paper, Typography, Box } from "@mui/material";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

export default function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {label}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(31, 111, 235, 0.08)",
          }}
        >
          <TrendingUpOutlinedIcon fontSize="small" />
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
        Audit-ready KPI • (mock)
      </Typography>
    </Paper>
  );
}
