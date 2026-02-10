import React, { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

// Icons for each document type
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";

interface DocumentOption {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  accentColor: string;
}

interface CreateDocumentModalProps {
  open: boolean;
  onClose: () => void;
}

// Memoized document option card component for better performance
const DocumentCard = React.memo(({ 
  option, 
  index, 
  onClick 
}: { 
  option: DocumentOption; 
  index: number; 
  onClick: () => void;
}) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "rgba(102, 126, 234, 0.2)",
        borderRadius: 3,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        willChange: "transform, box-shadow, border-color",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 60}ms both`,
        "@keyframes fadeIn": {
          "0%": {
            opacity: 0,
            transform: "translateY(12px) scale(0.98)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0) scale(1)",
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          bgcolor: option.accentColor,
          opacity: 0,
          transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        "&:hover": {
          borderColor: option.accentColor,
          transform: "translateY(-6px) scale(1.01)",
          boxShadow: `0 12px 32px -6px ${alpha(option.accentColor, 0.35)}`,
          "&::before": {
            opacity: 1,
          },
          "& .doc-icon": {
            transform: "scale(1.12) rotate(2deg)",
            bgcolor: alpha(option.accentColor, 0.18),
          },
        },
        "&:active": {
          transform: "translateY(-3px) scale(0.99)",
          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          className="doc-icon"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: alpha(option.accentColor, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: option.accentColor,
            mb: 2,
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {option.icon}
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1a1d21",
            mb: 0.75,
            fontSize: "16px",
          }}
        >
          {option.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            lineHeight: 1.5,
            fontSize: "13px",
          }}
        >
          {option.subtitle}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
));

DocumentCard.displayName = "DocumentCard";

function CreateDocumentModal({
  open,
  onClose,
}: CreateDocumentModalProps) {
  const navigate = useNavigate();

  // Memoize document options to prevent recreation on each render
  const documentOptions: DocumentOption[] = useMemo(() => [
    {
      title: "Standard Operating Procedure",
      subtitle: "Create comprehensive SOP documentation",
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 26 }} />,
      route: "/dms/new",
      accentColor: "#667eea",
    },
    {
      title: "Deviation Report",
      subtitle: "Document quality deviations and incidents",
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 26 }} />,
      route: "/deviations/new",
      accentColor: "#ef4444",
    },
    {
      title: "Training Record",
      subtitle: "Register employee training and certification",
      icon: <SchoolOutlinedIcon sx={{ fontSize: 26 }} />,
      route: "/training/new",
      accentColor: "#10b981",
    },
    {
      title: "CAPA",
      subtitle: "Initiate corrective and preventive action",
      icon: <FactCheckOutlinedIcon sx={{ fontSize: 26 }} />,
      route: "/capa/new",
      accentColor: "#f59e0b",
    },
    {
      title: "Change Control",
      subtitle: "Request and manage process changes",
      icon: <ChangeCircleOutlinedIcon sx={{ fontSize: 26 }} />,
      route: "/change-control/new",
      accentColor: "#8b5cf6",
    },
  ], []);

  // Memoize the click handler to prevent recreation
  const handleOptionClick = useCallback((route: string) => {
    onClose();
    navigate(route);
  }, [navigate, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.98)",
          boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.3)",
          maxWidth: 680,
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(102, 126, 234, 0.15)",
          },
        },
      }}
      TransitionProps={{
        timeout: 250,
      }}
    >
      {/* Clean Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 3,
          px: 4,
          pb: 1.5,
          background: "transparent",
          borderBottom: "none",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}
          >
            Create New Record
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Select a document type to begin
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#64748b",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "rgba(102, 126, 234, 0.1)",
              color: "#667eea",
              transform: "rotate(90deg)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent 
        sx={{ 
          px: 4, 
          pt: 2.5,
          pb: 4,
          background: "transparent",
          borderTop: "none",
          "&.MuiDialogContent-root": {
            borderTop: "none",
          }
        }}
      >
        <Grid container spacing={2.5}>
          {documentOptions.map((option, index) => (
            <DocumentCard
              key={option.title}
              option={option}
              index={index}
              onClick={() => handleOptionClick(option.route)}
            />
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(CreateDocumentModal);
