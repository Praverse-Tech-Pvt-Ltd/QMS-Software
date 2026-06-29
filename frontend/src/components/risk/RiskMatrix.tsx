import { Box, Typography, Tooltip } from "@mui/material";

interface RiskMatrixProps {
  /** 5x5 array: data[severity-1][occurrence-1] = count of risks at that cell */
  data: number[][];
  onCellClick?: (severity: number, occurrence: number) => void;
  selectedCell?: { severity: number; occurrence: number } | null;
}

function getCellColor(rpn: number): string {
  if (rpn <= 4) return "#C8E6C9";
  if (rpn <= 9) return "#FFF9C4";
  if (rpn <= 14) return "#FFE0B2";
  return "#FFCDD2";
}

function getCellTextColor(rpn: number): string {
  if (rpn <= 4) return "#1B5E20";
  if (rpn <= 9) return "#F57F17";
  if (rpn <= 14) return "#E65100";
  return "#B71C1C";
}

const AXIS_LABELS = ["1", "2", "3", "4", "5"];

export default function RiskMatrix({ data, onCellClick, selectedCell }: RiskMatrixProps) {
  const safeData: number[][] = Array.from({ length: 5 }, (_, si) =>
    Array.from({ length: 5 }, (_, oi) => data?.[si]?.[oi] ?? 0)
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
        {/* Y-axis label */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", mr: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: 1, mb: 1 }}
          >
            SEVERITY →
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[5, 4, 3, 2, 1].map((s) => (
              <Box key={s} sx={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">{s}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Grid */}
        <Box>
          <Box sx={{ display: "grid", gridTemplateRows: "repeat(5, 52px)", gridTemplateColumns: "repeat(5, 52px)", gap: "2px" }}>
            {[5, 4, 3, 2, 1].map((severity) =>
              [1, 2, 3, 4, 5].map((occurrence) => {
                const rpn = severity * occurrence;
                const count = safeData[severity - 1][occurrence - 1];
                const isSelected =
                  selectedCell?.severity === severity &&
                  selectedCell?.occurrence === occurrence;
                return (
                  <Tooltip
                    key={`${severity}-${occurrence}`}
                    title={`Severity ${severity}, Occurrence ${occurrence} — ${count} risk(s), RPN=${rpn}`}
                    arrow
                  >
                    <Box
                      onClick={() => onCellClick?.(severity, occurrence)}
                      sx={{
                        bgcolor: getCellColor(rpn),
                        border: isSelected ? `2px solid ${getCellTextColor(rpn)}` : "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: onCellClick ? "pointer" : "default",
                        transition: "all 0.15s",
                        "&:hover": onCellClick ? { opacity: 0.8, transform: "scale(1.08)" } : {},
                      }}
                    >
                      {count > 0 && (
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: getCellTextColor(rpn), fontSize: "0.8rem" }}
                        >
                          {count}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                );
              })
            )}
          </Box>

          {/* X-axis labels */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 52px)", gap: "2px", mt: "4px" }}>
            {AXIS_LABELS.map((l) => (
              <Box key={l} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">{l}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 0.5, letterSpacing: 1 }}>
            OCCURRENCE →
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        {[
          { label: "Low (RPN 1–4)", color: "#C8E6C9" },
          { label: "Medium (5–9)", color: "#FFF9C4" },
          { label: "High (10–14)", color: "#FFE0B2" },
          { label: "Critical (15–25)", color: "#FFCDD2" },
        ].map(({ label, color }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: "3px", border: "1px solid rgba(0,0,0,0.1)" }} />
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
