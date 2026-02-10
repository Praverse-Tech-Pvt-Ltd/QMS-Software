import { Snackbar, Alert, AlertTitle, Button, Box, LinearProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { transitions } from "../../theme/motion";

/**
 * Enhanced Toast Notifications
 * With action buttons, progress indicators, and premium animations
 */

export interface ToastProps {
  open: boolean;
  onClose: () => void;
  severity: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showProgress?: boolean;
  duration?: number;
}

export default function Toast({
  open,
  onClose,
  severity,
  title,
  message,
  action,
  showProgress = false,
  duration = 6000,
}: ToastProps) {
  const icons = {
    success: <CheckCircleIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          p: 0,
        },
      }}
    >
      <Alert
        severity={severity}
        icon={icons[severity]}
        onClose={onClose}
        sx={{
          minWidth: 320,
          borderRadius: 2,
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)",
          transition: transitions.card.default,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 15px 50px -10px rgba(0, 0, 0, 0.25)",
          },
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {action && (
              <Button
                size="small"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  transition: transitions.button.default,
                }}
              >
                {action.label}
              </Button>
            )}
          </Box>
        }
      >
        {title && <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>{title}</AlertTitle>}
        {message}
        
        {/* Progress bar for auto-dismiss */}
        {showProgress && (
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              mt: 1.5,
              height: 2,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                animation: `countdown ${duration}ms linear`,
                "@keyframes countdown": {
                  from: { transform: "translateX(0)" },
                  to: { transform: "translateX(-100%)" },
                },
              },
            }}
          />
        )}
      </Alert>
    </Snackbar>
  );
}

/**
 * Toast Hook for easy usage
 * 
 * Usage:
 * const toast = useToast();
 * toast.success("Changes saved!", { action: { label: "Undo", onClick: () => {} } });
 */

import { useState } from "react";

interface ToastState {
  open: boolean;
  severity: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  action?: { label: string; onClick: () => void };
  showProgress?: boolean;
  duration?: number;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    open: false,
    severity: "info",
    message: "",
  });

  const show = (
    severity: ToastState["severity"],
    message: string,
    options?: Partial<Omit<ToastState, "open" | "severity" | "message">>
  ) => {
    setState({
      open: true,
      severity,
      message,
      ...options,
    });
  };

  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return {
    ToastComponent: () => <Toast {...state} onClose={close} />,
    success: (message: string, options?: Partial<Omit<ToastState, "open" | "severity" | "message">>) =>
      show("success", message, options),
    error: (message: string, options?: Partial<Omit<ToastState, "open" | "severity" | "message">>) =>
      show("error", message, options),
    warning: (message: string, options?: Partial<Omit<ToastState, "open" | "severity" | "message">>) =>
      show("warning", message, options),
    info: (message: string, options?: Partial<Omit<ToastState, "open" | "severity" | "message">>) =>
      show("info", message, options),
    close,
  };
}
