import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { Department, QmsStatus } from "../../types/qms";
import { departments, qmsStatuses } from "../../types/qms";

export type FiltersState = {
  search: string;
  status: QmsStatus | "All";
  department: Department | "All";
};

export default function FiltersBar({
  filters,
  onChange,
}: {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "2fr 1fr 1fr",
        },
        alignItems: "center",
      }}
    >
      <TextField
        label="Search"
        placeholder="Search by ID / Title"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        size="small"
      />

      <FormControl size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as any })
          }
        >
          <MenuItem value="All">All</MenuItem>
          {qmsStatuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small">
        <InputLabel>Department</InputLabel>
        <Select
          label="Department"
          value={filters.department}
          onChange={(e) =>
            onChange({ ...filters, department: e.target.value as any })
          }
        >
          <MenuItem value="All">All</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
