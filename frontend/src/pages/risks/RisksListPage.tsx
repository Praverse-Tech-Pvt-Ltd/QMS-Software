import { Box, Button, Typography, Chip, CircularProgress, Alert, Card, CardContent, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { risksService, type RiskRecord, type RiskMatrixCell } from "../../services/risks.service";
import RiskScoreBadge from "../../components/common/RiskScoreBadge";
import RiskMatrix from "../../components/risk/RiskMatrix";

const COLUMNS: ColumnDef<RiskRecord>[] = [
  { field: "risk_number", headerName: "Risk #", width: 130 },
  { field: "title", headerName: "Title", width: 280 },
  { field: "risk_category", headerName: "Category", width: 130 },
  {
    field: "risk_level",
    headerName: "Risk Level",
    width: 180,
    renderCell: (row) => <RiskScoreBadge level={row.risk_level} score={row.rpn} />,
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (row) => <Chip label={row.status} size="small" sx={{ textTransform: "capitalize" }} />,
  },
];

export default function RisksListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<number[][] | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ severity: number; occurrence: number } | null>(null);

  useEffect(() => {
    risksService.list()
      .then(setRows)
      .catch(() => setError("Failed to load risks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    risksService.getMatrix()
      .then((cells: RiskMatrixCell[]) => {
        const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
        cells.forEach((cell) => {
          if (cell.severity >= 1 && cell.severity <= 5 && cell.occurrence >= 1 && cell.occurrence <= 5) {
            grid[cell.severity - 1][cell.occurrence - 1] = cell.count;
          }
        });
        setMatrixData(grid);
      })
      .catch(() => setMatrixData(Array.from({ length: 5 }, () => Array(5).fill(0))))
      .finally(() => setMatrixLoading(false));
  }, []);

  const visibleRows = useMemo(() => {
    if (!selectedCell) return rows;
    return rows.filter((r) => r.severity === selectedCell.severity && r.occurrence === selectedCell.occurrence);
  }, [rows, selectedCell]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Risk Register</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/risks/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          New Risk
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Risk Matrix (FMEA)</Typography>
          {matrixLoading ? (
            <Skeleton variant="rectangular" width={350} height={260} sx={{ borderRadius: 1 }} />
          ) : (
            <RiskMatrix
              data={matrixData ?? Array.from({ length: 5 }, () => Array(5).fill(0))}
              selectedCell={selectedCell}
              onCellClick={(severity, occurrence) =>
                setSelectedCell((prev) =>
                  prev?.severity === severity && prev?.occurrence === occurrence ? null : { severity, occurrence }
                )
              }
            />
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {selectedCell && (
          <Chip
            label={`Filtered: Severity ${selectedCell.severity} × Occurrence ${selectedCell.occurrence} — Clear filter`}
            size="small"
            onDelete={() => setSelectedCell(null)}
            sx={{ bgcolor: "#EEF2FF", color: "#667eea", fontWeight: 600 }}
          />
        )}
      </Box>

      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={visibleRows} onView={(id) => navigate(`/risks/${id}`)} />
      )}
    </Box>
  );
}
