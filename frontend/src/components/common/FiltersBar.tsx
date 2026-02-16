import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import type { Department, QmsStatus } from "../../services/permission.service";
import { departments, qmsStatuses } from "../../services/permission.service";

export type FiltersState = {
  search: string;
  status: QmsStatus | "All";
  department: Department | "All";
};

export default function FiltersBar({
  filters,
  onChange,
  onClear,
}: {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  onClear?: () => void;
}) {
  const hasFilters = filters.search || filters.status !== "All" || filters.department !== "All";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        border: "1px solid #E9ECEF",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search by ID, title, or keyword..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          size="small"
          sx={{
            minWidth: 280,
            flex: 1,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#FAFBFC",
              "&:hover": {
                bgcolor: "#F7F8FA",
              },
              "&.Mui-focused": {
                bgcolor: "#FFFFFF",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: "#858D96", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as any })
            }
            sx={{
              bgcolor: "#FAFBFC",
              "&:hover": {
                bgcolor: "#F7F8FA",
              },
            }}
          >
            <MenuItem value="All">All Status</MenuItem>
            {qmsStatuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Department Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Department</InputLabel>
          <Select
            label="Department"
            value={filters.department}
            onChange={(e) =>
              onChange({ ...filters, department: e.target.value as any })
            }
            sx={{
              bgcolor: "#FAFBFC",
              "&:hover": {
                bgcolor: "#F7F8FA",
              },
            }}
          >
            <MenuItem value="All">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear Filters */}
        {hasFilters && onClear && (
          <Button
            variant="text"
            size="small"
            startIcon={<FilterListOutlinedIcon />}
            onClick={onClear}
            sx={{
              color: "#858D96",
              "&:hover": {
                color: "#6366F1",
                bgcolor: "#F3F4F6",
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>
    </Paper>
  );
}
