import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AIRemarkField from "../../components/common/AIRemarkField";
import {
  analystQualificationService,
  type AnalyticalTechnique,
  type AnalystQualificationRecord,
  type QualificationMatrix,
} from "../../services/analystQualification.service";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#F3F4F6", color: "#374151" },
  under_review: { bg: "#FEF3C7", color: "#92400E" },
  qualified: { bg: "#D1FAE5", color: "#065F46" },
  not_qualified: { bg: "#FEE2E2", color: "#991B1B" },
  expired: { bg: "#F3F4F6", color: "#6B7280" },
};

const NEXT_ACTIONS: Record<string, string[]> = {
  pending: ["under_review"],
  under_review: ["qualified", "not_qualified"],
  qualified: ["expired", "not_qualified"],
  not_qualified: ["pending"],
  expired: ["pending"],
};

const ESIG_REQUIRED_ACTIONS = ["qualified", "not_qualified"];

const ACTION_LABELS: Record<string, string> = {
  under_review: "Submit for Review",
  qualified: "Approve",
  not_qualified: "Reject",
  expired: "Mark Expired",
  pending: "Resubmit",
};

const COMPLEXITY_OPTIONS = [
  { value: "complex", label: "Complex" },
  { value: "non_complex", label: "Non-Complex" },
];

const EMPTY_TECHNIQUE_FORM = { name: "", complexity: "complex" as AnalyticalTechnique["complexity"], description: "" };

function StatusChip({ status, label }: { status: string; label: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <Chip label={label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
}

export default function AnalystQualificationPage() {
  const [tab, setTab] = useState(0);

  const [techniques, setTechniques] = useState<AnalyticalTechnique[]>([]);
  const [records, setRecords] = useState<AnalystQualificationRecord[]>([]);
  const [matrix, setMatrix] = useState<QualificationMatrix>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [esigOpen, setEsigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [remarkConfirmed, setRemarkConfirmed] = useState(false);

  const [techniqueDialogOpen, setTechniqueDialogOpen] = useState(false);
  const [techniqueForm, setTechniqueForm] = useState(EMPTY_TECHNIQUE_FORM);
  const [savingTechnique, setSavingTechnique] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [techniquesData, recordsData, matrixData] = await Promise.all([
        analystQualificationService.listTechniques(),
        analystQualificationService.listRecords(),
        analystQualificationService.matrix(),
      ]);
      setTechniques(techniquesData);
      setRecords(recordsData);
      setMatrix(matrixData);
    } catch {
      setError("Failed to load analyst qualification data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const analystNameById = useMemo(() => {
    const map: Record<string, string> = {};
    records.forEach((r) => {
      map[r.analyst] = r.analyst_name || r.analyst;
    });
    return map;
  }, [records]);

  const matrixAnalystIds = useMemo(() => Object.keys(matrix), [matrix]);

  const selectedRecord = records.find((r) => r.id === selectedId) || null;

  const handleTransitionClick = (action: string) => {
    setPendingAction(action);
    if (ESIG_REQUIRED_ACTIONS.includes(action)) {
      setEsigOpen(true);
    } else {
      doTransition(action, undefined);
    }
  };

  const doTransition = async (action: string, password?: string) => {
    if (!selectedId) return;
    await analystQualificationService.transition(selectedId, action, remark, password);
    setRemark("");
    setRemarkConfirmed(false);
    await loadAll();
  };

  const handleCreateTechnique = async () => {
    if (!techniqueForm.name.trim()) return;
    setSavingTechnique(true);
    try {
      await analystQualificationService.createTechnique(techniqueForm);
      setTechniqueDialogOpen(false);
      setTechniqueForm(EMPTY_TECHNIQUE_FORM);
      await loadAll();
    } catch {
      setError("Failed to create analytical technique.");
    } finally {
      setSavingTechnique(false);
    }
  };

  const RECORD_COLUMNS: ColumnDef<AnalystQualificationRecord>[] = [
    { field: "qualification_id", headerName: "Qualification #", width: 150 },
    { field: "analyst_name", headerName: "Analyst", width: 160 },
    { field: "technique_name", headerName: "Technique", width: 180 },
    { field: "qualification_date", headerName: "Qualified On", width: 130 },
    { field: "expiry_date", headerName: "Expires", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (row) => <StatusChip status={row.status} label={row.status_display} />,
    },
  ];

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Analyst Qualification</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTechniqueDialogOpen(true)}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
        >
          New Technique
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Qualification Matrix" />
        <Tab label="Records" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#F8F9FA" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>
                  Analyst
                </TableCell>
                {techniques.map((t) => (
                  <TableCell key={t.id} align="center" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    {t.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {matrixAnalystIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={techniques.length + 1} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No qualification records found.
                  </TableCell>
                </TableRow>
              ) : (
                matrixAnalystIds.map((analystId) => (
                  <TableRow key={analystId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{analystNameById[analystId] || analystId}</TableCell>
                    {techniques.map((t) => {
                      const cell = matrix[analystId]?.[t.id];
                      return (
                        <TableCell key={t.id} align="center">
                          {cell ? (
                            <Box>
                              <StatusChip status={cell.status} label={cell.status.replace("_", " ")} />
                              {cell.expiry_date && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                  exp {cell.expiry_date}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Box>
          <ModuleTable
            columns={RECORD_COLUMNS}
            rows={records}
            onView={(id) => {
              setSelectedId(id);
              setRemark("");
              setRemarkConfirmed(false);
            }}
          />

          {selectedRecord && (
            <Card sx={{ borderRadius: 3, mt: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {selectedRecord.qualification_id} — {selectedRecord.analyst_name} / {selectedRecord.technique_name}
                  </Typography>
                  <StatusChip status={selectedRecord.status} label={selectedRecord.status_display} />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Qualified On</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedRecord.qualification_date || "—"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Expires</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedRecord.expiry_date || "—"}</Typography>
                  </Box>
                </Box>

                {selectedRecord.status === "under_review" && (
                  <Box sx={{ mb: 2 }}>
                    <AIRemarkField
                      module="analyst_qualification"
                      recordId={selectedRecord.id}
                      approverRole="qa_manager"
                      stage="review"
                      value={remark}
                      onRemarkChange={setRemark}
                      onConfirmChange={setRemarkConfirmed}
                    />
                  </Box>
                )}

                <Box sx={{ display: "flex", gap: 1 }}>
                  {(NEXT_ACTIONS[selectedRecord.status] || []).map((action) => (
                    <Button
                      key={action}
                      variant="contained"
                      disabled={selectedRecord.status === "under_review" && !remarkConfirmed && ESIG_REQUIRED_ACTIONS.includes(action)}
                      onClick={() => handleTransitionClick(action)}
                      sx={{
                        bgcolor: action === "not_qualified" ? "#EF4444" : "#667eea",
                        "&:hover": { bgcolor: action === "not_qualified" ? "#DC2626" : "#5a6fd8" },
                      }}
                    >
                      {ACTION_LABELS[action] || action}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      <ESignatureDialog
        open={esigOpen}
        title={`${pendingAction === "not_qualified" ? "Reject" : "Approve"} Analyst Qualification`}
        meaning={`I ${pendingAction === "not_qualified" ? "reject" : "approve"} qualification ${selectedRecord?.qualification_id || ""} for ${selectedRecord?.analyst_name || ""}.`}
        onConfirm={async (password) => {
          if (pendingAction) await doTransition(pendingAction, password);
        }}
        onClose={() => {
          setEsigOpen(false);
          setPendingAction(null);
        }}
      />

      <Dialog open={techniqueDialogOpen} onClose={() => setTechniqueDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Analytical Technique</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            required
            value={techniqueForm.name}
            onChange={(e) => setTechniqueForm({ ...techniqueForm, name: e.target.value })}
            autoFocus
          />
          <TextField
            select
            label="Complexity"
            fullWidth
            value={techniqueForm.complexity}
            onChange={(e) => setTechniqueForm({ ...techniqueForm, complexity: e.target.value as AnalyticalTechnique["complexity"] })}
          >
            {COMPLEXITY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={techniqueForm.description}
            onChange={(e) => setTechniqueForm({ ...techniqueForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTechniqueDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTechnique}
            disabled={savingTechnique || !techniqueForm.name.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
