import { Box, Button, Paper, Tab, Tabs, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// ✅ 1. Update Interface to include optional tabs
interface DetailTabsLayoutProps {
  title: string;
  subtitle?: string;
  statusChip?: ReactNode;
  showBack?: boolean;
  backTo?: string;
  rightPanel: ReactNode;
  overview: ReactNode;
  attachments: ReactNode;
  activity: ReactNode;
  approvals: ReactNode;
  impact?: ReactNode;
  plan?: ReactNode;
  trainees?: ReactNode;
  actions?: ReactNode;
}

export default function DetailTabsLayout({
  title,
  subtitle,
  statusChip,
  showBack = true,
  backTo,
  rightPanel,
  overview,
  attachments,
  activity,
  approvals,
  impact,
  plan,
  trainees,
  actions,
}: DetailTabsLayoutProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  // ✅ 2. Dynamic Tab Config
  // This array builds the tabs based on what props are available
  const tabs = [
    { label: "Overview", content: overview },
    ...(trainees ? [{ label: "Trainee Tracking", content: trainees }] : []),
    ...(impact ? [{ label: "Impact Assessment", content: impact }] : []),
    ...(plan ? [{ label: "Implementation Plan", content: plan }] : []),
    ...(actions ? [{ label: "Actions", content: actions }] : []),
    { label: "Attachments", content: attachments },
    { label: "Activity", content: activity },
    { label: "Approvals", content: approvals },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showBack && (
              <Button
                variant="text"
                startIcon={<ArrowBackOutlinedIcon />}
                onClick={() => {
                  if (backTo) navigate(backTo);
                  else navigate(-1);
                }}
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
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {statusChip}
      </Box>

      {/* Layout */}
      <Box
        sx={{
          mt: 2.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Left Content (Tabs) */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            minHeight: 500,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} />
            ))}
          </Tabs>

          {/* Render Active Tab Content */}
          <Box sx={{ mt: 2 }}>{tabs[tabIndex]?.content}</Box>
        </Paper>

        {/* Right Panel (Timeline / Actions) */}
        <Box>{rightPanel}</Box>
      </Box>
    </Box>
  );
}
