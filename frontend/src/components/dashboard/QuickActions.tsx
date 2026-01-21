import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Quick Actions
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/dms/new")}
        >
          + Create Document
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/deviations/new")}
        >
          + Raise Deviation
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/capa/new")}
        >
          + Create CAPA
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/change-control/new")}
        >
          + Initiate Change
        </Button>
      </Box>
    </Paper>
  );
}
