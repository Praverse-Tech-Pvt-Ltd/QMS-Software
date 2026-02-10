import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import { transitions } from "../../theme/motion";

/**
 * Breadcrumb Navigation Component
 * Provides clear navigation hierarchy
 * Auto-generates breadcrumbs from route path
 */

interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Map route segments to human-readable labels
const routeLabels: Record<string, string> = {
  dms: "Documents",
  deviations: "Deviations",
  capa: "CAPA",
  "change-control": "Change Control",
  training: "Training",
  settings: "Settings",
  create: "Create New",
  edit: "Edit",
  view: "View",
  dashboard: "Dashboard",
};

export default function Breadcrumb() {
  const location = useLocation();

  // Generate breadcrumb items from path
  const breadcrumbItems: BreadcrumbItem[] = [];
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Always start with home
  if (pathSegments.length > 0) {
    breadcrumbItems.push({ label: "Home", path: "/" });
  }

  // Build breadcrumb trail
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Check if segment is an ID (numbers or UUID format)
    const isId = /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);

    if (isId) {
      // Don't show IDs in breadcrumb, just label as "Details"
      breadcrumbItems.push({
        label: "Details",
        path: isLast ? undefined : currentPath,
      });
    } else {
      breadcrumbItems.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: isLast ? undefined : currentPath,
      });
    }
  });

  // Don't show breadcrumbs on home page
  if (breadcrumbItems.length <= 1) return null;

  return (
    <Box
      sx={{
        mb: 2,
        py: 1,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: "#CBD5E0" }} />}
        aria-label="breadcrumb"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          if (isLast || !item.path) {
            return (
              <Typography
                key={item.path || index}
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: transitions.button.default,
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {index === 0 && <HomeIcon sx={{ fontSize: 16 }} />}
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
