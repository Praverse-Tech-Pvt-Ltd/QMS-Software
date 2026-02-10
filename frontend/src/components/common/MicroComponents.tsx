import { Box, Tooltip, Typography } from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";

/**
 * Relative Timestamp Component
 * Shows "2 hours ago" with full date on hover
 */

interface RelativeTimeProps {
  date: Date | string;
  showTooltip?: boolean;
}

export default function RelativeTime({ date, showTooltip = true }: RelativeTimeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const relative = formatDistanceToNow(dateObj, { addSuffix: true });
  const full = format(dateObj, "PPpp"); // e.g., "Apr 29, 2021, 12:53:00 PM"

  const content = (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontSize: "0.813rem",
      }}
    >
      {relative}
    </Typography>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip title={full} arrow>
      <Box component="span">{content}</Box>
    </Tooltip>
  );
}

/**
 * Status Badge with Pulse Animation
 * For live/active indicators
 */

interface StatusBadgeProps {
  status: "online" | "offline" | "busy" | "away";
  label?: string;
  showPulse?: boolean;
}

export function StatusBadge({ status, label, showPulse = true }: StatusBadgeProps) {
  const colors = {
    online: "#10B981",
    offline: "#858D96",
    busy: "#DC2626",
    away: "#F59E0B",
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: colors[status],
          }}
        />
        {showPulse && status === "online" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: colors[status],
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  opacity: 1,
                  transform: "scale(1)",
                },
                "50%": {
                  opacity: 0,
                  transform: "scale(2)",
                },
              },
            }}
          />
        )}
      </Box>
      {label && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Copy to Clipboard Button
 * With success feedback animation
 */

import { useState } from "react";
import { IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { transitions } from "../../theme/motion";

interface CopyButtonProps {
  text: string;
  tooltip?: string;
}

export function CopyButton({ text, tooltip = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Tooltip title={copied ? "Copied!" : tooltip}>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{
          transition: transitions.button.default,
          "&:hover": {
            bgcolor: "rgba(99, 102, 241, 0.08)",
          },
        }}
      >
        {copied ? (
          <CheckIcon sx={{ fontSize: 18, color: "#10B981" }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
