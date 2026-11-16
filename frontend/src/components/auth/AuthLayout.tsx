import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { color } from "../../theme/tokens";

const POINTS = [
  "Deviations, CAPA and change control in one traceable record",
  "Electronic signatures and audit trails for 21 CFR Part 11",
  "Controlled documents, training and inspection readiness",
];

/** Split layout for sign-in and sign-up: context on the left, form on the right. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 5fr) 7fr" }, bgcolor: color.surface }}>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 5,
          bgcolor: color.sidebar,
          borderRight: `1px solid ${color.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: "6px", bgcolor: color.accent, color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 700 }}>
            N
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: color.ink, lineHeight: 1.2 }}>NexGen Pharma</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: color.textMuted, lineHeight: 1.2 }}>Quality Management System</Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 420 }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 600, color: color.ink, lineHeight: 1.3, letterSpacing: "-0.01em", mb: 3 }}>
            The site's system of record for quality.
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1.5 }}>
            {POINTS.map((p, i) => (
              <Box component="li" key={p} sx={{ display: "flex", gap: 1.5, alignItems: "baseline" }}>
                <Typography component="span" sx={{ fontSize: "0.75rem", fontWeight: 600, color: color.accent, fontVariantNumeric: "tabular-nums", minWidth: 18 }}>
                  0{i + 1}
                </Typography>
                <Typography component="span" sx={{ fontSize: "0.875rem", color: color.textSecondary }}>
                  {p}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption">© {new Date().getFullYear()} NexGen Pharma Solutions Pvt. Ltd.</Typography>
      </Box>

      <Box component="main" sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, py: 6 }}>
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 4 }}>
            <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: color.accent, color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>
              N
            </Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: color.ink }}>NexGen Pharma QMS</Typography>
          </Box>
          <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3.5 }}>
            {subtitle}
          </Typography>
          {children}
          {footer && <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${color.border}` }}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
