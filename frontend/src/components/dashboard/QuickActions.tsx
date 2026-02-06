import { Box, Card, Grid, Typography, useTheme, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const quickActions = [
  {
    id: "document",
    title: "Create Document",
    description: "Draft a new SOP or policy",
    icon: <DescriptionOutlinedIcon />,
    path: "/dms/new",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#667eea",
    bgColor: "#EEF2FF",
  },
  {
    id: "deviation",
    title: "Report Deviation",
    description: "Log quality incident",
    icon: <ReportProblemOutlinedIcon />,
    path: "/deviations/new",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#f5576c",
    bgColor: "#FFF5F7",
  },
  {
    id: "capa",
    title: "Create CAPA",
    description: "Initiate corrective action",
    icon: <FactCheckOutlinedIcon />,
    path: "/capa/new",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#4facfe",
    bgColor: "#EFF9FF",
  },
  {
    id: "change",
    title: "Initiate Change",
    description: "Start change control",
    icon: <ChangeCircleOutlinedIcon />,
    path: "/change-control/new",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    color: "#fa709a",
    bgColor: "#FFF8F0",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1a1d1f",
            fontSize: "1.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Quick Actions
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#858D96",
            fontWeight: 500,
          }}
        >
          Get started quickly
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={action.id}>
            <Card
              elevation={0}
              onClick={() => navigate(action.path)}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: alpha(action.color, 0.15),
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: "#ffffff",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: action.gradient,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&:hover": {
                  borderColor: alpha(action.color, 0.3),
                  bgcolor: action.bgColor,
                  transform: "translateY(-4px)",
                  boxShadow: `0 12px 24px ${alpha(action.color, 0.15)}`,
                  "&::before": {
                    opacity: 1,
                  },
                  "& .action-icon": {
                    background: action.gradient,
                    transform: "scale(1.1) rotate(5deg)",
                    "& svg": {
                      color: "#ffffff",
                    },
                  },
                  "& .arrow-icon": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {/* Icon Container */}
              <Box
                className="action-icon"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: action.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: -2,
                    borderRadius: 3,
                    background: action.gradient,
                    opacity: 0.1,
                    zIndex: -1,
                  },
                }}
              >
                <Box 
                  sx={{ 
                    color: action.color, 
                    fontSize: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.3s ease",
                  }}
                >
                  {action.icon}
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#1a1d1f",
                      fontWeight: 700,
                      fontSize: "1rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {action.title}
                  </Typography>
                  <ArrowForwardIcon
                    className="arrow-icon"
                    sx={{
                      fontSize: 16,
                      color: action.color,
                      opacity: 0,
                      transform: "translateX(-8px)",
                      transition: "all 0.3s ease",
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#6C737F",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {action.description}
                </Typography>
              </Box>

              {/* Decorative Element */}
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: action.gradient,
                  opacity: 0.05,
                  pointerEvents: "none",
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
