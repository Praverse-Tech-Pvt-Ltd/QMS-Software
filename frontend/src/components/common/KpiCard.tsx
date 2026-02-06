import { Card, Typography, Box } from "@mui/material";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";

export default function KpiCard({
  label,
  value,
  trend,
  trendValue,
}: {
  label: string;
  value: number | string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E9ECEF",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 6px -1px rgba(0, 0, 0, 0.1)",
          borderColor: "#DFE2E6",
        },
      }}
    >
      <Box>
        {/* KPI Label */}
        <Typography
          variant="body2"
          sx={{
            color: "#858D96",
            fontWeight: 500,
            mb: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>

        {/* KPI Value */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1A1D21",
            mb: 1,
          }}
        >
          {value}
        </Typography>

        {/* Optional trend indicator */}
        {trend && trendValue && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {trend === "up" && (
              <>
                <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: "#0A8754" }} />
                <Typography variant="caption" sx={{ color: "#0A8754", fontWeight: 600 }}>
                  {trendValue}
                </Typography>
              </>
            )}
            {trend === "down" && (
              <>
                <TrendingDownOutlinedIcon sx={{ fontSize: 16, color: "#DC2626" }} />
                <Typography variant="caption" sx={{ color: "#DC2626", fontWeight: 600 }}>
                  {trendValue}
                </Typography>
              </>
            )}
            {trend === "neutral" && (
              <Typography variant="caption" sx={{ color: "#858D96", fontWeight: 600 }}>
                {trendValue}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}
