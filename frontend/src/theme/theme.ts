import { createTheme, type Shadows } from "@mui/material/styles";
import { color, fontFamily, radius, transition } from "./tokens";

declare module "@mui/material/styles" {
  interface Palette {
    subtle: string;
  }
  interface PaletteOptions {
    subtle?: string;
  }
  interface TypeBackground {
    subtle?: string;
  }
}

// Flat by default: borders carry structure. Only floating layers (menus,
// popovers, dialogs) get a real shadow.
const floating = "0 1px 2px rgba(24, 26, 32, 0.06), 0 8px 24px -4px rgba(24, 26, 32, 0.14)";
const shadows = [
  "none",
  "0 1px 2px rgba(24, 26, 32, 0.05)",
  "0 1px 3px rgba(24, 26, 32, 0.07)",
  "0 2px 6px -1px rgba(24, 26, 32, 0.08)",
  "0 4px 10px -2px rgba(24, 26, 32, 0.10)",
  ...Array(20).fill(floating),
] as Shadows;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: color.accent, dark: color.accentHover, light: color.accentSoft, contrastText: "#FFFFFF" },
    secondary: { main: color.textSecondary, contrastText: "#FFFFFF" },
    success: { main: color.success, light: color.successSoft, contrastText: "#FFFFFF" },
    warning: { main: color.warning, light: color.warningSoft, contrastText: "#FFFFFF" },
    error: { main: color.error, light: color.errorSoft, contrastText: "#FFFFFF" },
    info: { main: color.info, light: color.infoSoft, contrastText: "#FFFFFF" },
    background: { default: color.canvas, paper: color.surface, subtle: color.sidebar },
    text: { primary: color.ink, secondary: color.textSecondary, disabled: "#9A9CA1" },
    divider: color.border,
    action: {
      hover: "rgba(24, 26, 32, 0.04)",
      selected: color.accentSoft,
      focus: "rgba(65, 71, 180, 0.12)",
    },
    grey: {
      50: "#FAF9F7",
      100: color.canvas,
      200: color.border,
      300: color.borderStrong,
      400: "#8C8E93",
      500: color.textMuted,
      600: color.textSecondary,
      700: "#33353B",
      800: "#24262C",
      900: color.ink,
    },
  },
  shape: { borderRadius: radius.control },
  shadows,
  typography: {
    fontFamily,
    htmlFontSize: 16,
    h1: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.015em" },
    h2: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em" },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: color.ink },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35, color: color.ink },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4, color: color.ink },
    subtitle1: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.45, color: color.ink },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.45, color: color.ink },
    body1: { fontSize: "0.875rem", lineHeight: 1.55, color: color.textSecondary },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5, color: color.textSecondary },
    caption: { fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.4, color: color.textMuted },
    overline: { fontSize: "0.6875rem", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.06em", color: color.textMuted },
    button: { fontSize: "0.8125rem", fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  },
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
      easeOut: "cubic-bezier(0.25, 1, 0.5, 1)",
      easeIn: "cubic-bezier(0.5, 0, 0.75, 0)",
      sharp: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
    duration: {
      shortest: 120,
      shorter: 150,
      short: 180,
      standard: 200,
      complex: 240,
      enteringScreen: 200,
      leavingScreen: 150,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: color.canvas, color: color.ink },
        "*:focus-visible": { outline: `2px solid ${color.accent}`, outlineOffset: 2 },
        "table, .MuiTableCell-root": { fontVariantNumeric: "tabular-nums" },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          minHeight: 36,
          padding: "6px 14px",
          transition: transition(),
          "&:focus-visible": { outline: `2px solid ${color.accent}`, outlineOffset: 2 },
        },
        sizeSmall: { minHeight: 30, padding: "4px 10px", fontSize: "0.75rem" },
        sizeLarge: { minHeight: 42, padding: "8px 18px", fontSize: "0.875rem" },
        contained: { "&:hover": { backgroundColor: color.accentHover } },
        outlined: {
          borderColor: color.borderStrong,
          color: color.ink,
          backgroundColor: color.surface,
          "&:hover": { borderColor: color.textMuted, backgroundColor: color.canvas },
        },
        outlinedPrimary: { color: color.accent },
        text: { "&:hover": { backgroundColor: "rgba(24, 26, 32, 0.05)" } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          color: color.textSecondary,
          transition: transition(),
          "&:hover": { backgroundColor: "rgba(24, 26, 32, 0.06)", color: color.ink },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none", backgroundColor: color.surface },
        outlined: { borderColor: color.border },
        elevation0: { border: `1px solid ${color.border}` },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${color.border}`, borderRadius: radius.control + 2, boxShadow: "none" },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 16, "&:last-child": { paddingBottom: 16 } } } },
    MuiMenu: { styleOverrides: { paper: { border: `1px solid ${color.border}` } } },
    MuiPopover: { styleOverrides: { paper: { border: `1px solid ${color.border}` } } },
    MuiDialog: { styleOverrides: { paper: { border: "none", borderRadius: radius.control + 4 } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: color.surface, borderColor: color.border } } },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: { root: { backgroundColor: color.surface, borderBottom: `1px solid ${color.border}` } },
    },
    MuiTableContainer: { styleOverrides: { root: { backgroundColor: color.surface } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${color.border}`, padding: "8px 12px", fontSize: "0.8125rem", color: color.textSecondary },
        head: {
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: color.textMuted,
          backgroundColor: color.canvas,
          whiteSpace: "nowrap",
        },
        sizeSmall: { padding: "6px 12px" },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: transition(["background-color"]),
          "&.MuiTableRow-hover:hover": { backgroundColor: "rgba(24, 26, 32, 0.03)" },
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.chip, fontWeight: 600, fontSize: "0.75rem", height: 24 },
        sizeSmall: { height: 22, fontSize: "0.6875rem" },
        label: { paddingLeft: 8, paddingRight: 8 },
        outlined: { borderColor: color.borderStrong },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: color.surface,
          fontSize: "0.875rem",
          transition: transition(["border-color", "box-shadow"]),
          "& .MuiOutlinedInput-notchedOutline": { borderColor: color.borderStrong },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color.textMuted },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color.accent, borderWidth: 2 },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: color.error },
        },
        input: { padding: "9px 12px" },
        inputSizeSmall: { padding: "6px 10px" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "0.875rem", color: color.textSecondary, "&.Mui-focused": { color: color.accent } },
        shrink: { fontWeight: 500 },
        // Re-centre labels for the denser input padding set on MuiOutlinedInput.
        outlined: {
          transform: "translate(12px, 9px) scale(1)",
          "&.MuiInputLabel-sizeSmall": { transform: "translate(10px, 6px) scale(1)" },
          "&.MuiInputLabel-shrink": { transform: "translate(12px, -9px) scale(0.75)" },
        },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 0, fontSize: "0.75rem" } } },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 40, borderBottom: `1px solid ${color.border}` },
        indicator: { height: 2, backgroundColor: color.accent },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          padding: "8px 12px",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: color.textSecondary,
          "&.Mui-selected": { color: color.ink, fontWeight: 600 },
          "&:hover": { color: color.ink },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: color.ink, fontSize: "0.75rem", fontWeight: 500, borderRadius: 4 } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 2, backgroundColor: color.border }, bar: { borderRadius: 2 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.control, fontSize: "0.8125rem", alignItems: "flex-start" },
        standardSuccess: { backgroundColor: color.successSoft, color: color.success },
        standardWarning: { backgroundColor: color.warningSoft, color: color.warning },
        standardError: { backgroundColor: color.errorSoft, color: color.error },
        standardInfo: { backgroundColor: color.infoSoft, color: color.info },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: color.border } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          transition: transition(),
          "&.Mui-selected": { backgroundColor: color.accentSoft, color: color.accent },
          "&.Mui-selected:hover": { backgroundColor: color.accentSoft },
        },
      },
    },
  },
});
