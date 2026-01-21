import { Box, Button, Paper, Tab, Tabs, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type TabKey = "overview" | "attachments" | "activity" | "approvals";

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
}: {
  title: string;
  subtitle?: string;
  statusChip?: React.ReactNode;

  showBack?: boolean;
  backTo?: string;

  rightPanel: React.ReactNode;
  overview: React.ReactNode;
  attachments: React.ReactNode;
  activity: React.ReactNode;
  approvals: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const navigate = useNavigate();

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
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
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
        {/* Left Content */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" value="overview" />
            <Tab label="Attachments" value="attachments" />
            <Tab label="Activity" value="activity" />
            <Tab label="Approvals" value="approvals" />
          </Tabs>

          {tab === "overview" && <Box>{overview}</Box>}
          {tab === "attachments" && <Box>{attachments}</Box>}
          {tab === "activity" && <Box>{activity}</Box>}
          {tab === "approvals" && <Box>{approvals}</Box>}
        </Paper>

        {/* Right Panel */}
        <Box>{rightPanel}</Box>
      </Box>
    </Box>
  );
}
