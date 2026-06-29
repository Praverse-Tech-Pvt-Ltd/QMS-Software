import { Chip } from "@mui/material";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

const STYLES: Record<RiskLevel, { bgcolor: string; color: string; border: string }> = {
  Low: { bgcolor: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  Medium: { bgcolor: "#FEF3C7", color: "#B45309", border: "#FCD34D" },
  High: { bgcolor: "#FFEDD5", color: "#9A3412", border: "#FCA5A5" },
  Critical: { bgcolor: "#FEE2E2", color: "#991B1B", border: "#F87171" },
};

interface RiskScoreBadgeProps {
  level: RiskLevel | string;
  score?: number;
  size?: "small" | "medium";
}

export default function RiskScoreBadge({ level, score, size = "small" }: RiskScoreBadgeProps) {
  const style = STYLES[level as RiskLevel] || STYLES.Medium;
  const label = score !== undefined ? `${level} (RPN: ${score})` : level;

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 700,
        fontSize: "0.72rem",
        height: size === "small" ? 22 : 28,
      }}
    />
  );
}
