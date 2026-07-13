import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Alert, CircularProgress, TextField, MenuItem, Divider,
} from "@mui/material";
import {
  instrumentsService, type Instrument, type CalibrationRecord, type NewCalibrationRecord,
} from "../../services/laboratory.service";
import ESignatureDialog from "../common/ESignatureDialog";

const RESULT_COLORS: Record<string, { bg: string; color: string }> = {
  pass: { bg: "#D1FAE5", color: "#065F46" },
  adjusted: { bg: "#FEF3C7", color: "#92400E" },
  fail: { bg: "#FEE2E2", color: "#991B1B" },
};

const EMPTY_FORM: Omit<NewCalibrationRecord, "esig_password"> = {
  calibration_date: new Date().toISOString().slice(0, 10),
  calibration_type: "external",
  result: "pass",
  certificate_number: "",
  next_due_date: "",
};

interface Props {
  instrument: Instrument;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function InstrumentCalibrationDialog({ instrument, open, onClose, onUpdated }: Props) {
  const [records, setRecords] = useState<CalibrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [esigOpen, setEsigOpen] = useState(false);

  const load = () => {
    setLoading(true);
    instrumentsService.listCalibrations(instrument.id)
      .then(setRecords)
      .catch(() => setError("Failed to load calibration history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (open) load(); }, [open, instrument.id]);

  const openRecordForm = () => {
    setForm({
      ...EMPTY_FORM,
      next_due_date: new Date(Date.now() + instrument.calibration_frequency_days * 86400000).toISOString().slice(0, 10),
    });
    setFormOpen(true);
  };

  const proceedToSign = () => {
    if (!form.next_due_date) return;
    setFormOpen(false);
    setEsigOpen(true);
  };

  const submit = async (password: string) => {
    await instrumentsService.recordCalibration(instrument.id, { ...form, esig_password: password });
    load();
    onUpdated();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>{instrument.name}</Typography>
              <Typography variant="caption" color="text.secondary">{instrument.instrument_id}</Typography>
            </Box>
            <Button variant="contained" onClick={openRecordForm}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
              Record Calibration
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? <CircularProgress /> : records.length === 0 ? (
            <Alert severity="info">No calibration records yet.</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Certificate #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Next Due</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => {
                  const c = RESULT_COLORS[r.result] || RESULT_COLORS.pass;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{r.calibration_date}</TableCell>
                      <TableCell>{r.calibration_type_display}</TableCell>
                      <TableCell><Chip label={r.result_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} /></TableCell>
                      <TableCell>{r.certificate_number || "—"}</TableCell>
                      <TableCell>{r.next_due_date}</TableCell>
                      <TableCell>{r.performed_by_name || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Record Calibration</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Calibration Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
            value={form.calibration_date} onChange={(e) => setForm({ ...form, calibration_date: e.target.value })} />
          <TextField select label="Type" fullWidth value={form.calibration_type}
            onChange={(e) => setForm({ ...form, calibration_type: e.target.value as NewCalibrationRecord["calibration_type"] })}>
            <MenuItem value="internal">Internal</MenuItem>
            <MenuItem value="external">External (vendor)</MenuItem>
          </TextField>
          <TextField select label="Result" fullWidth value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value as NewCalibrationRecord["result"] })}>
            <MenuItem value="pass">Pass</MenuItem>
            <MenuItem value="adjusted">Pass after adjustment</MenuItem>
            <MenuItem value="fail">Fail</MenuItem>
          </TextField>
          <TextField label="Certificate Number (optional)" fullWidth
            value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} />
          <TextField label="Next Due Date" type="date" fullWidth required InputLabelProps={{ shrink: true }}
            value={form.next_due_date} onChange={(e) => setForm({ ...form, next_due_date: e.target.value })} />
          <Divider />
          {form.result === "fail" && (
            <Alert severity="warning">Recording a failed calibration will mark this instrument Out of Service.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={proceedToSign} disabled={!form.next_due_date}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Continue to Sign
          </Button>
        </DialogActions>
      </Dialog>

      <ESignatureDialog
        open={esigOpen}
        title="Sign Calibration Record"
        meaning={`I certify the calibration result recorded for ${instrument.instrument_id} — ${instrument.name}.`}
        onConfirm={async (password) => { await submit(password); }}
        onClose={() => setEsigOpen(false)}
      />
    </>
  );
}
