import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { actionItemsService, type ActionItemRecord } from "../../services/ai.service";

export interface ActionItem {
  id?: string;
  action: string;
  category: string;
  suggested_owner_role: string;
  suggested_due_date: string;
  status?: "open" | "in_progress" | "closed" | "extended" | "pending" | "completed" | "overdue";
  owner_role?: string;
  due_date?: string;
  assigned_to?: string | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  training: { bg: "#EEF2FF", text: "#4F46E5" },
  validation: { bg: "#F0FDF4", text: "#166534" },
  documentation: { bg: "#FEF3C7", text: "#92400E" },
  investigation: { bg: "#FEE2E2", text: "#991B1B" },
  regulatory_filing: { bg: "#FDF4FF", text: "#6B21A8" },
  implementation: { bg: "#F0F9FF", text: "#075985" },
};

const ROLES = ["qa_head", "qa_manager", "qa_executive", "qa", "qc", "production", "warehouse"];

function toActionItem(record: ActionItemRecord): ActionItem {
  return {
    id: record.id,
    action: record.action,
    category: record.category,
    suggested_owner_role: record.suggested_owner_role,
    suggested_due_date: record.due_date || "",
    status: record.status,
    owner_role: record.assigned_to_detail?.username || record.suggested_owner_role,
    due_date: record.due_date || undefined,
    assigned_to: record.assigned_to,
  };
}

interface ActionMatrixProps {
  actions: ActionItem[];
  onChange: (updated: ActionItem[]) => void;
  readonly?: boolean;
  /** When provided, edits are persisted via the action-items API instead of local state only. */
  recordType?: string;
  recordId?: string;
}

interface CloseDialogState {
  open: boolean;
  index: number | null;
  note: string;
}

interface ExtendDialogState {
  open: boolean;
  index: number | null;
  dueDate: string;
  reason: string;
}

export default function ActionMatrix({ actions, onChange, readonly = false, recordType, recordId }: ActionMatrixProps) {
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });
  const [closeDialog, setCloseDialog] = useState<CloseDialogState>({ open: false, index: null, note: "" });
  const [extendDialog, setExtendDialog] = useState<ExtendDialogState>({ open: false, index: null, dueDate: "", reason: "" });

  const persistenceEnabled = Boolean(recordType && recordId);

  useEffect(() => {
    if (!persistenceEnabled) return;
    actionItemsService.list(recordType!, recordId!)
      .then((items) => {
        if (items.length > 0) onChange(items.map(toActionItem));
      })
      .catch(() => {
        // Loading persisted items is best-effort — the freshly-extracted list still renders.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordType, recordId]);

  const updateAction = (index: number, field: keyof ActionItem, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const persistField = async (index: number, payload: Record<string, string>) => {
    const item = actions[index];
    if (!item?.id) return;
    try {
      const updated = await actionItemsService.update(item.id, payload);
      const next = [...actions];
      next[index] = toActionItem(updated);
      onChange(next);
      setToast({ open: true, message: "Saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Save failed — try again", severity: "error" });
    }
  };

  const handleOwnerChange = (index: number, value: string) => {
    updateAction(index, "owner_role", value);
    if (persistenceEnabled) persistField(index, { assigned_to: value });
  };

  const handleDueDateChange = (index: number, value: string) => {
    updateAction(index, "due_date", value);
    if (persistenceEnabled) persistField(index, { due_date: value });
  };

  const handleCloseSubmit = async () => {
    const { index, note } = closeDialog;
    if (index === null) return;
    const item = actions[index];
    if (!item?.id) return;
    try {
      const updated = await actionItemsService.close(item.id, note);
      const next = [...actions];
      next[index] = toActionItem(updated);
      onChange(next);
      setToast({ open: true, message: "Saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Save failed — try again", severity: "error" });
    } finally {
      setCloseDialog({ open: false, index: null, note: "" });
    }
  };

  const handleExtendSubmit = async () => {
    const { index, dueDate, reason } = extendDialog;
    if (index === null) return;
    const item = actions[index];
    if (!item?.id) return;
    try {
      const updated = await actionItemsService.extend(item.id, dueDate, reason);
      const next = [...actions];
      next[index] = toActionItem(updated);
      onChange(next);
      setToast({ open: true, message: "Saved", severity: "success" });
    } catch {
      setToast({ open: true, message: "Save failed — try again", severity: "error" });
    } finally {
      setExtendDialog({ open: false, index: null, dueDate: "", reason: "" });
    }
  };

  if (actions.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
        <Typography variant="body2">No action items extracted yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#F9FAFB" }}>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151" }}>Action</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", width: 130 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", width: 160 }}>Owner</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", width: 130 }}>Due Date</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", width: 100 }}>Status</TableCell>
            {persistenceEnabled && !readonly && (
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151", width: 150 }}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {actions.map((action, index) => {
            const catStyle = CATEGORY_COLORS[action.category] || { bg: "#F3F4F6", text: "#374151" };
            const isClosed = action.status === "closed";
            return (
              <TableRow key={action.id || index} hover>
                <TableCell>
                  {readonly ? (
                    <Typography variant="body2">{action.action}</Typography>
                  ) : (
                    <TextField
                      size="small"
                      value={action.action}
                      onChange={(e) => updateAction(index, "action", e.target.value)}
                      multiline
                      fullWidth
                      variant="standard"
                      inputProps={{ style: { fontSize: "0.8rem" } }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={action.category.replace(/_/g, " ")}
                    size="small"
                    sx={{
                      bgcolor: catStyle.bg,
                      color: catStyle.text,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      height: 20,
                      textTransform: "capitalize",
                    }}
                  />
                </TableCell>
                <TableCell>
                  {readonly || isClosed ? (
                    <Typography variant="body2">{action.owner_role || action.suggested_owner_role}</Typography>
                  ) : (
                    <Select
                      size="small"
                      value={action.owner_role || action.suggested_owner_role}
                      onChange={(e) => handleOwnerChange(index, e.target.value)}
                      sx={{ fontSize: "0.78rem", height: 28 }}
                      fullWidth
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r} sx={{ fontSize: "0.78rem" }}>
                          {r.replace(/_/g, " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {readonly || isClosed ? (
                    <Typography variant="body2">{action.due_date || action.suggested_due_date}</Typography>
                  ) : (
                    <TextField
                      size="small"
                      type="date"
                      value={action.due_date || action.suggested_due_date}
                      onChange={(e) => handleDueDateChange(index, e.target.value)}
                      sx={{ "& .MuiInputBase-input": { fontSize: "0.78rem", py: 0.5 } }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={action.status || "pending"}
                    size="small"
                    color={
                      action.status === "closed" || action.status === "completed"
                        ? "success"
                        : action.status === "overdue"
                        ? "error"
                        : action.status === "extended"
                        ? "warning"
                        : "default"
                    }
                    sx={{ fontSize: "0.68rem", height: 20 }}
                  />
                </TableCell>
                {persistenceEnabled && !readonly && (
                  <TableCell>
                    {!isClosed && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button size="small" variant="outlined"
                          onClick={() => setCloseDialog({ open: true, index, note: "" })}>
                          Close
                        </Button>
                        <Button size="small" variant="outlined" color="warning"
                          onClick={() => setExtendDialog({ open: true, index, dueDate: action.due_date || action.suggested_due_date, reason: "" })}>
                          Extend
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={closeDialog.open} onClose={() => setCloseDialog({ open: false, index: null, note: "" })} maxWidth="sm" fullWidth>
        <DialogTitle>Close Action Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Evidence note (min 20 characters)" multiline rows={3} fullWidth required
            value={closeDialog.note}
            onChange={(e) => setCloseDialog({ ...closeDialog, note: e.target.value })}
            sx={{ mt: 1 }}
            helperText={`${closeDialog.note.trim().length}/20 minimum`}
            error={closeDialog.note.trim().length > 0 && closeDialog.note.trim().length < 20}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialog({ open: false, index: null, note: "" })}>Cancel</Button>
          <Button variant="contained" disabled={closeDialog.note.trim().length < 20} onClick={handleCloseSubmit}>
            Close Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={extendDialog.open} onClose={() => setExtendDialog({ open: false, index: null, dueDate: "", reason: "" })} maxWidth="sm" fullWidth>
        <DialogTitle>Extend Action Item</DialogTitle>
        <DialogContent>
          <TextField
            label="New due date" type="date" fullWidth required
            InputLabelProps={{ shrink: true }}
            value={extendDialog.dueDate}
            onChange={(e) => setExtendDialog({ ...extendDialog, dueDate: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Extension reason (min 30 characters)" multiline rows={3} fullWidth required
            value={extendDialog.reason}
            onChange={(e) => setExtendDialog({ ...extendDialog, reason: e.target.value })}
            helperText={`${extendDialog.reason.trim().length}/30 minimum`}
            error={extendDialog.reason.trim().length > 0 && extendDialog.reason.trim().length < 30}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialog({ open: false, index: null, dueDate: "", reason: "" })}>Cancel</Button>
          <Button variant="contained"
            disabled={!extendDialog.dueDate || extendDialog.reason.trim().length < 30}
            onClick={handleExtendSubmit}>
            Extend
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
