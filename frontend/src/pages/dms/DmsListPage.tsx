import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useNavigate } from "react-router-dom";

import StatusChip from "../../components/qms/StatusChip";
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Import the Service and Type
import { dmsService, type DmsDocument } from "../../services/dms.service";

const STATUS_FILTERS = ["All", "Draft", "Review", "Approved", "Effective", "Obsolete"];

export default function DmsListPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  
  // Data State
  const [documents, setDocuments] = useState<DmsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [permissionDenied, setPermissionDenied] = useState({ open: false, message: "" });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await dmsService.list(); 
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents", err);
      // In development without backend, you might want to suppress this or show empty state
      setError("Failed to connect to the server. Is Django running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // ✅ FIX: Check if role exists before checking permissions
    const canCreate = role ? permissionService.can(role, "dms", "create") : false;

    if (!canCreate) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to create documents. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/dms/new");
  };

  // Client-side filtering
  const filteredDocs = statusFilter === "All"
    ? documents
    : documents.filter((d) => d.status === statusFilter.toUpperCase());

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Document Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Repository for SOPs, Policies, and Work Instructions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleCreateNew}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Create New
        </Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            fullWidth
            placeholder="Search documents..."
            InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} /> }}
          />
          <Button variant="outlined" startIcon={<FilterListOutlinedIcon />} sx={{ borderRadius: 3, px: 3 }}>
            Filters
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" fontWeight={600}>Status:</Typography>
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              size="small"
              variant={statusFilter === s ? "contained" : "outlined"}
              onClick={() => setStatusFilter(s)}
              sx={{ borderRadius: 3, textTransform: "none", m: 0.5 }}
            >
              {s}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead" sx={{ bgcolor: "grey.50" }}>
            <Box component="tr">
              {["ID", "Title", "Type", "Department", "Status", "Actions"].map((h) => (
                <Box key={h} component="th" sx={{ textAlign: "left", px: 3, py: 2, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
                  {h.toUpperCase()}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {filteredDocs.length === 0 && (
               <Box component="tr">
                 <Box component="td" colSpan={6} sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                   No documents found.
                 </Box>
               </Box>
            )}
            {filteredDocs.map((doc) => (
              <Box component="tr" key={doc.id} sx={{ borderTop: "1px solid rgba(0,0,0,0.06)", "&:hover": { bgcolor: "grey.50" } }}>
                <Box component="td" sx={{ px: 3, py: 2, fontWeight: 600, color: "primary.main" }}>
                  {doc.document_id}
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>{doc.title}</Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>{doc.doc_type}</Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>{doc.department}</Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  <StatusChip status={doc.status} />
                </Box>
                <Box component="td" sx={{ px: 3, py: 2 }}>
                  <IconButton size="small" onClick={() => navigate(`/dms/${doc.id}`)}>
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}