import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1F6FEB",
    },
    background: {
      default: "#F7F8FA",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
});
