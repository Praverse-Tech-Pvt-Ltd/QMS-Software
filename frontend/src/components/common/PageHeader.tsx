import { Box, Button, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  showBack,
  actions,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showBack && (
            <Button
              variant="text"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackOutlinedIcon />}
              sx={{ minWidth: "auto", px: 1 }}
            >
              Back
            </Button>
          )}

          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
        </Box>

        {subtitle && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && <Box>{actions}</Box>}
    </Box>
  );
}
