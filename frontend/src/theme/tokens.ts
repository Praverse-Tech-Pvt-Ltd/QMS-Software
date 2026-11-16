// Design tokens. Source of truth: DESIGN.md at the repo root.
// Defined in OKLCH, shipped as hex because MUI's color helpers cannot parse OKLCH.

export const color = {
  canvas: "#F8F7F4", // oklch(0.975 0.004 85)
  surface: "#FEFDFC", // oklch(0.995 0.002 85)
  sidebar: "#F2F0EC", // oklch(0.955 0.006 85)
  border: "#E0DEDA", // oklch(0.90 0.006 85)
  borderStrong: "#C6C4BE", // oklch(0.82 0.008 85)

  ink: "#181A20", // oklch(0.22 0.012 270)
  textSecondary: "#4D5057", // oklch(0.43 0.012 270)
  textMuted: "#666970", // oklch(0.52 0.012 270)

  accent: "#4147B4", // oklch(0.46 0.17 275)
  accentHover: "#33379B", // oklch(0.40 0.16 275)
  accentSoft: "#E9EEFF", // oklch(0.95 0.025 275)

  success: "#21763C",
  successSoft: "#DFF6E2",
  warning: "#975800",
  warningSoft: "#FFEFD1",
  error: "#BA2B2E",
  errorSoft: "#FFE7E4",
  info: "#2B6991",
  infoSoft: "#E0F1FE",
} as const;

export const fontFamily =
  '"Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

export const radius = { control: 6, chip: 4 } as const;

export const easeOutQuart = "cubic-bezier(0.25, 1, 0.5, 1)";
export const transition = (props: string[] = ["background-color", "border-color", "color"]) =>
  props.map((p) => `${p} 160ms ${easeOutQuart}`).join(", ");
