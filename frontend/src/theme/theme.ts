import { createTheme } from "@mui/material/styles";

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

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1",
      light: "#818CF8",
      dark: "#4F46E5",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F9FE",
      paper: "#FFFFFF",
      subtle: "#FAFBFF",
    },
    grey: {
      50: "#FAFBFC",
      100: "#F7F8FA",
      200: "#E9ECEF",
      300: "#DFE2E6",
      400: "#858D96",
      500: "#5C6370",
      700: "#2D3339",
      900: "#1A1D21",
    },
    success: {
      main: "#10B981",
      light: "#D1FAE5",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
      contrastText: "#92400E",
    },
    error: {
      main: "#DC2626",
      light: "#FEE2E2",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#6B7280",
      light: "#F3F4F6",
      contrastText: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: "#1A1D21",
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: "#2D3339",
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#2D3339",
    },
    subtitle1: {
      fontSize: "0.938rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: "#2D3339",
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.6,
      color: "#5C6370",
    },
    body2: {
      fontSize: "0.813rem",
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#858D96",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.4,
      color: "#858D96",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    "0 2px 6px -1px rgba(0, 0, 0, 0.1)",
    "0 4px 8px -2px rgba(0, 0, 0, 0.1)",
    "0 6px 10px -3px rgba(0, 0, 0, 0.1)",
    "0 8px 12px -4px rgba(0, 0, 0, 0.1)",
    "0 10px 14px -5px rgba(0, 0, 0, 0.1)",
    "0 12px 16px -6px rgba(0, 0, 0, 0.12)",
    "0 14px 18px -7px rgba(0, 0, 0, 0.12)",
    "0 16px 20px -8px rgba(0, 0, 0, 0.12)",
    "0 18px 22px -9px rgba(0, 0, 0, 0.14)",
    "0 20px 24px -10px rgba(0, 0, 0, 0.14)",
    "0 22px 26px -11px rgba(0, 0, 0, 0.14)",
    "0 24px 28px -12px rgba(0, 0, 0, 0.16)",
    "0 26px 30px -13px rgba(0, 0, 0, 0.16)",
    "0 16px 32px -8px rgba(0, 0, 0, 0.2)",
    "0 18px 34px -9px rgba(0, 0, 0, 0.2)",
    "0 20px 36px -10px rgba(0, 0, 0, 0.2)",
    "0 22px 38px -11px rgba(0, 0, 0, 0.22)",
    "0 24px 40px -12px rgba(0, 0, 0, 0.22)",
    "0 26px 42px -13px rgba(0, 0, 0, 0.22)",
    "0 28px 44px -14px rgba(0, 0, 0, 0.24)",
    "0 30px 46px -15px rgba(0, 0, 0, 0.24)",
    "0 24px 48px -12px rgba(0, 0, 0, 0.25)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
        },
        contained: {
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(31, 111, 235, 0.25)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "#FAFBFC",
          },
        },
        sizeSmall: {
          padding: "6px 16px",
        },
        sizeLarge: {
          padding: "12px 28px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #E9ECEF",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        elevation2: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F3F4F6",
          padding: "16px",
        },
        head: {
          fontWeight: 600,
          fontSize: "0.813rem",
          color: "#5C6370",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          backgroundColor: "#FAFBFC",
          borderBottom: "2px solid #E9ECEF",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#FAFBFC",
          },
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.75rem",
          letterSpacing: "0.02em",
          border: "1px solid",
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#858D96",
            },
            "&.Mui-focused fieldset": {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#5C6370",
          "&:hover": {
            backgroundColor: "#F3F4F6",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#858D96",
          minHeight: 48,
          "&.Mui-selected": {
            color: "#6366F1",
            fontWeight: 600,
          },
          "&:hover": {
            color: "#5C6370",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "2px solid #E9ECEF",
        },
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
  },
});
