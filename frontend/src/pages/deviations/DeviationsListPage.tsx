import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FiltersBar, {
  type FiltersState,
} from "../../components/common/FiltersBar";
import ModuleTable, { type ModuleRow } from "../../components/common/ModuleTable";
import { deviationsService } from "../../services/deviations.service";

export default function DeviationsListPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<ModuleRow[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "All",
    department: "All",
  });

  useEffect(() => {
    deviationsService.list().then((data) => setRows(data as any));
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.title.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "All" ? true : r.status === filters.status;

      const matchesDept =
        filters.department === "All"
          ? true
          : r.department === filters.department;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [rows, filters]);

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Deviations / Incidents
        </Typography>

        <Button variant="contained" onClick={() => navigate("/deviations/new")}>
          + Raise Deviation
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mt: 2 }}>
        <FiltersBar filters={filters} onChange={setFilters} />
      </Box>

      {/* Table */}
      <ModuleTable
        rows={filteredRows}
        onView={(id) => navigate(`/deviations/${id}`)}
        onEdit={(id) => navigate(`/deviations/${id}`)}
        onClone={(id) => console.log("Clone mock:", id)}
      />

    </Box>
  );
}
