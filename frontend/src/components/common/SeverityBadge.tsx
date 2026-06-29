import { Chip } from "@mui/material";

export type SeverityLevel = "critical" | "major" | "minor" | "observation";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: "small" | "medium";
}

const COLORS: Record<SeverityLevel, { bg: string; text: string }> = {
  critical:    { bg: "#D32F2F", text: "#fff" },
  major:       { bg: "#E65100", text: "#fff" },
  minor:       { bg: "#F9A825", text: "#333" },
  observation: { bg: "#757575", text: "#fff" },
};

export default function SeverityBadge({ severity, size = "small" }: SeverityBadgeProps) {
  const { bg, text } = COLORS[severity] || { bg: "#9E9E9E", text: "#fff" };
  return (
    <Chip
      label={severity.toUpperCase()}
      size={size}
      sx={{
        backgroundColor: bg,
        color: text,
        fontWeight: 600,
        fontSize: size === "small" ? "0.65rem" : "0.75rem",
        letterSpacing: "0.03em",
      }}
    />
  );
}
