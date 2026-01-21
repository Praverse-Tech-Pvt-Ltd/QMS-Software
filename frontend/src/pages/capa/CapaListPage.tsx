import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import FiltersBar, { type FiltersState } from "../../components/common/FiltersBar";
import ModuleTable, { type ModuleRow } from "../../components/common/ModuleTable";
import { capaService } from "../../services/capa.service";
import { useNavigate } from "react-router-dom";

export default function CapaListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ModuleRow[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "All",
    department: "All",
  });

  useEffect(() => {
    capaService.list().then((data) => setRows(data as any));
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          CAPA
        </Typography>

        <Button variant="contained" onClick={() => navigate("/capa/new")}>
          + Create New
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <FiltersBar filters={filters} onChange={setFilters} />
      </Box>

      <ModuleTable
        rows={filteredRows}
        onView={(id) => navigate(`/capa/${id}`)}
        onEdit={(id) => navigate(`/capa/${id}`)}
        onClone={(id) => console.log("Clone mock:", id)}
      />

    </Box>
  );
}
