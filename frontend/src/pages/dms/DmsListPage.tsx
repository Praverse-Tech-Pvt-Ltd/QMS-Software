import { Box, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import FiltersBar, { type FiltersState } from "../../components/common/FiltersBar";
import ModuleTable from "../../components/common/ModuleTable";
import { dmsService } from "../../services/dms.service";
import type { ModuleRow } from "../../components/common/ModuleTable";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { useSnackbar } from "notistack";

export default function DmsListPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<ModuleRow[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "All",
    department: "All",
  });

  useEffect(() => {
    dmsService.list().then((data) => setRows(data as any));
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
      <PageHeader
        title="Document Management"
        subtitle="Controlled documents • SOPs • Templates • Records"
        actions={
          <Button variant="contained" onClick={() => navigate("/dms/new")}>
            + Create New
          </Button>
        }
      />

      <Box sx={{ mt: 2 }}>
        <FiltersBar filters={filters} onChange={setFilters} />
      </Box>

      <ModuleTable
        rows={filteredRows}
        onView={(id) => navigate(`/dms/${id}`)}
        onEdit={(id) => {
          enqueueSnackbar(`Edit ${id} (mock)`, { variant: "info" });
          navigate(`/dms/${id}`); // for now open detail
        }}
        onClone={(id) => {
          enqueueSnackbar(`Clone ${id} (mock)`, { variant: "info" });
          console.log("Clone mock:", id);
        }}
      />
    </Box>
  );
}
