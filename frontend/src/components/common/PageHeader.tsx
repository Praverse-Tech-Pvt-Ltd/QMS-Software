import { Box, Button, Typography, Breadcrumbs, Link } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  showBack,
  actions,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1.5 }}>
          {breadcrumbs.map((crumb, index) => (
            crumb.path ? (
              <Link
                key={index}
                onClick={() => navigate(crumb.path!)}
                sx={{
                  fontSize: "0.813rem",
                  color: "#858D96",
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": { color: "#6366F1" },
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography
                key={index}
                sx={{
                  fontSize: "0.813rem",
                  color: "#2D3339",
                  fontWeight: 500,
                }}
              >
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      {/* Title Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {showBack && (
              <Button
                variant="text"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackOutlinedIcon />}
                sx={{
                  minWidth: "auto",
                  px: 1,
                  color: "#5C6370",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                    color: "#6366F1",
                  },
                }}
              >
                Back
              </Button>
            )}

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1A1D21",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </Typography>
          </Box>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: "#858D96",
                mt: 1,
                maxWidth: "800px",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
