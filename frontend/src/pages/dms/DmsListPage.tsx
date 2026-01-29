import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useNavigate } from "react-router-dom";

import StatusChip from "../../components/qms/StatusChip";
import type { WorkflowStatus } from "../../types/workflow.types";

type DocumentRow = {
  id: string;
  title: string;
  owner: string;
  department: string;
  status: WorkflowStatus;
  updated: string;
};

const STATUS_FILTERS: ("All" | WorkflowStatus)[] = [
  "All",
  "Draft",
  "In Review",
  "Approved",
  "Effective",
  "Closed",
];

export default function DmsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"All" | WorkflowStatus>(
    "All",
  );

  const documents: DocumentRow[] = [
    {
      id: "SOP-QA-2024-015",
      title: "Manufacturing Process Standard Operating Procedure",
      owner: "Sarah Johnson",
      department: "Quality Assurance",
      status: "Effective",
      updated: "2026-01-15",
    },
    {
      id: "SOP-QA-2024-016",
      title: "Equipment Qualification and Validation Protocol",
      owner: "Michael Chen",
      department: "Quality Control",
      status: "In Review",
      updated: "2026-01-20",
    },
    {
      id: "SOP-QA-2024-017",
      title: "Environmental Monitoring Procedures",
      owner: "Emily Rodriguez",
      department: "Quality Assurance",
      status: "Draft",
      updated: "2026-01-22",
    },
    {
      id: "SOP-QA-2024-014",
      title: "Batch Release Documentation Requirements",
      owner: "David Williams",
      department: "Production",
      status: "Approved",
      updated: "2026-01-18",
    },
    {
      id: "SOP-QA-2023-089",
      title: "Change Control Management System",
      owner: "Jennifer Lee",
      department: "Quality Assurance",
      status: "Closed",
      updated: "2025-12-30",
    },
  ];

  const filteredDocs =
    statusFilter === "All"
      ? documents
      : documents.filter((d) => d.status === statusFilter);

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Document Management System
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Centralized repository for all controlled documents and SOPs
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Create New
        </Button>
      </Stack>

      {/* Search + Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            fullWidth
            placeholder="Search documents..."
            InputProps={{
              startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListOutlinedIcon />}
            sx={{ borderRadius: 3, px: 3 }}
          >
            Filters
          </Button>
        </Stack>

        {/* Status Filters */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            Status:
          </Typography>

          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              size="small"
              variant={statusFilter === s ? "contained" : "outlined"}
              onClick={() => setStatusFilter(s)}
              sx={{ borderRadius: 3, textTransform: "none" }}
            >
              {s}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead" sx={{ bgcolor: "grey.50" }}>
            <Box component="tr">
              {[
                "Document ID",
                "Title",
                "Owner",
                "Department",
                "Status",
                "Updated",
                "Actions",
              ].map((h) => (
                <Box
                  key={h}
                  component="th"
                  sx={{
                    textAlign: "left",
                    px: 3,
                    py: 2,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "text.secondary",
                  }}
                >
                  {h.toUpperCase()}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {filteredDocs.map((doc) => (
              <Box
                component="tr"
                key={doc.id}
                sx={{
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  "&:hover": { bgcolor: "grey.50" },
                }}
              >
                <Box
                  component="td"
                  sx={{ px: 3, py: 2, fontWeight: 600, color: "primary.main" }}
                >
                  {doc.id}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  {doc.title}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  {doc.owner}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  {doc.department}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  <StatusChip status={doc.status} />
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  {doc.updated}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/dms/${doc.id}`)}
                  >
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
