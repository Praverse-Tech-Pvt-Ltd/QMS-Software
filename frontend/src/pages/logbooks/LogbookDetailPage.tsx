import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, CircularProgress, Alert,
  Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import {
  logbooksService, type Logbook, type LogbookEntry, type NewLogbookEntry,
} from "../../services/logbooks.service";
import ESignatureDialog from "../../components/common/ESignatureDialog";
import AIRemarkField from "../../components/common/AIRemarkField";

const CONDITION_COLORS: Record<string, { bg: string; color: string }> = {
  normal: { bg: "#D1FAE5", color: "#065F46" },
  abnormal: { bg: "#FEF3C7", color: "#92400E" },
  out_of_service: { bg: "#FEE2E2", color: "#991B1B" },
};

const EMPTY_ENTRY_FORM = {
  entry_date: new Date().toISOString().slice(0, 10),
  entry_time: new Date().toTimeString().slice(0, 8),
  activity: "",
  usage_hours: "",
  batch_lot: "",
  condition: "normal" as NewLogbookEntry["condition"],
};

export default function LogbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logbook, setLogbook] = useState<Logbook | null>(null);
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [entryForm, setEntryForm] = useState(EMPTY_ENTRY_FORM);
  const [esigOpen, setEsigOpen] = useState(false);
  const [advisoryEntryId, setAdvisoryEntryId] = useState<string | null>(null);
  const [advisoryDraft, setAdvisoryDraft] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [lb, ents] = await Promise.all([
        logbooksService.getById(id),
        logbooksService.listEntries(id),
      ]);
      setLogbook(lb);
      setEntries(ents);
    } catch {
      setError("Failed to load logbook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const openAddDialog = () => {
    setEntryForm(EMPTY_ENTRY_FORM);
    setAddOpen(true);
  };

  const proceedToSign = () => {
    if (!entryForm.activity.trim()) return;
    setAddOpen(false);
    setEsigOpen(true);
  };

  const submitEntry = async (password: string) => {
    if (!id) return;
    const created = await logbooksService.addEntry(id, { ...entryForm, esig_password: password });
    await load();
    if (created.condition !== "normal") {
      setAdvisoryDraft(created.ai_remark_draft || "");
      setAdvisoryEntryId(created.id);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!logbook) return null;

  const advisoryEntry = entries.find((e) => e.id === advisoryEntryId) || null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/logbooks")}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{logbook.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {logbook.logbook_type_display} {logbook.department && `· ${logbook.department}`} {logbook.location && `· ${logbook.location}`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          Add Entry
        </Button>
      </Box>

      {advisoryEntry && (
        <Card sx={{ borderRadius: 3, mb: 3, border: "1px solid #FEF3C7" }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Advisory: {advisoryEntry.condition_display} condition recorded
            </Typography>
            <AIRemarkField
              module="logbook"
              recordId={advisoryEntry.id}
              approverRole="production_supervisor"
              stage="abnormal_entry"
              value={advisoryDraft}
              onRemarkChange={setAdvisoryDraft}
              onConfirmChange={() => { /* no-op — Save Draft button handles persistence */ }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => setAdvisoryEntryId(null)}>Dismiss</Button>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
                onClick={async () => {
                  await logbooksService.updateEntryRemarkDraft(advisoryEntry.id, advisoryDraft);
                  await load();
                  setAdvisoryEntryId(null);
                }}
              >
                Save Draft
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ borderRadius: 3 }}>
        {entries.length === 0 ? (
          <CardContent><Alert severity="info">No entries recorded yet.</Alert></CardContent>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>Date / Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Batch / Lot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Usage Hrs</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((e) => {
                const c = CONDITION_COLORS[e.condition] || CONDITION_COLORS.normal;
                return (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.entry_date} {e.entry_time}</TableCell>
                    <TableCell>{e.activity}</TableCell>
                    <TableCell>{e.performed_by_name || "—"}</TableCell>
                    <TableCell>{e.batch_lot || "—"}</TableCell>
                    <TableCell>{e.usage_hours || "—"}</TableCell>
                    <TableCell>
                      <Chip label={e.condition_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Add Logbook Entry</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={entryForm.entry_date} onChange={(e) => setEntryForm({ ...entryForm, entry_date: e.target.value })} />
            <TextField label="Time" type="time" fullWidth InputLabelProps={{ shrink: true }}
              value={entryForm.entry_time} onChange={(e) => setEntryForm({ ...entryForm, entry_time: e.target.value })} />
          </Box>
          <TextField label="Activity" fullWidth required multiline minRows={2} autoFocus
            value={entryForm.activity} onChange={(e) => setEntryForm({ ...entryForm, activity: e.target.value })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Usage Hours (optional)" type="number" fullWidth
              value={entryForm.usage_hours} onChange={(e) => setEntryForm({ ...entryForm, usage_hours: e.target.value })} />
            <TextField label="Batch / Lot (optional)" fullWidth
              value={entryForm.batch_lot} onChange={(e) => setEntryForm({ ...entryForm, batch_lot: e.target.value })} />
          </Box>
          <TextField select label="Condition" fullWidth value={entryForm.condition}
            onChange={(e) => setEntryForm({ ...entryForm, condition: e.target.value as NewLogbookEntry["condition"] })}>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="abnormal">Abnormal</MenuItem>
            <MenuItem value="out_of_service">Out of Service</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={proceedToSign} disabled={!entryForm.activity.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Continue to Sign
          </Button>
        </DialogActions>
      </Dialog>

      <ESignatureDialog
        open={esigOpen}
        title="Sign Logbook Entry"
        meaning="I attest this logbook entry is accurate and complete."
        onConfirm={async (password) => { await submitEntry(password); }}
        onClose={() => setEsigOpen(false)}
      />
    </Box>
  );
}
