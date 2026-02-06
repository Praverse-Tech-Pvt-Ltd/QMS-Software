import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import App from "./app/App";
import { theme } from "./theme/theme";
import { RoleProvider } from "./app/providers/RoleProvider";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={4000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        style={{ zIndex: 9999 }}
      >
      <RoleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RoleProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
