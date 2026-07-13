import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Tabs, Tab, Button, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OutboxIcon from "@mui/icons-material/Outbox";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import {
  inventoryService,
  type InventoryCategory,
  type InventoryItem,
  type InventoryLot,
  type InventoryUsageLog,
} from "../../services/inventory.service";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  in_use: { bg: "#D1FAE5", color: "#065F46" },
  quarantine: { bg: "#FEF3C7", color: "#92400E" },
  expired: { bg: "#FEE2E2", color: "#991B1B" },
  consumed: { bg: "#F3F4F6", color: "#374151" },
};

const ITEM_COLUMNS: ColumnDef<InventoryItem>[] = [
  { field: "item_code", headerName: "Item Code", width: 130 },
  { field: "name", headerName: "Name", width: 220 },
  { field: "category_name", headerName: "Category", width: 160 },
  { field: "manufacturer", headerName: "Manufacturer", width: 160 },
  { field: "unit", headerName: "Unit", width: 90 },
  { field: "minimum_stock", headerName: "Min. Stock", width: 110 },
];

const LOT_COLUMNS: ColumnDef<InventoryLot>[] = [
  { field: "item_code", headerName: "Item Code", width: 120 },
  { field: "item_name", headerName: "Item", width: 200 },
  { field: "lot_number", headerName: "Lot #", width: 130 },
  { field: "received_date", headerName: "Received", width: 120 },
  { field: "expiry_date", headerName: "Expiry", width: 120 },
  { field: "current_quantity", headerName: "Current Qty", width: 110 },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (row) => {
      const c = STATUS_COLORS[row.status] || STATUS_COLORS.in_use;
      return <Chip label={row.status_display} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    },
  },
];

const USAGE_COLUMNS: ColumnDef<InventoryUsageLog>[] = [
  { field: "lot_number", headerName: "Lot #", width: 130 },
  { field: "quantity_used", headerName: "Qty Used", width: 110 },
  { field: "used_by_name", headerName: "Used By", width: 160 },
  { field: "used_date", headerName: "Date", width: 120 },
  { field: "purpose", headerName: "Purpose", width: 240 },
];

const EMPTY_ITEM_FORM = {
  item_code: "", name: "", category: "", manufacturer: "", catalog_no: "",
  storage_condition: "", unit: "", minimum_stock: "",
};

const EMPTY_LOT_FORM = {
  item: "", lot_number: "", received_date: new Date().toISOString().slice(0, 10),
  expiry_date: "", initial_quantity: "", purity_percent: "",
};

const EMPTY_USAGE_FORM = {
  lot: "", quantity_used: "", used_date: new Date().toISOString().slice(0, 10),
  purpose: "", linked_sample: "",
};

const EMPTY_CATEGORY_FORM = { name: "" };

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [usageLogs, setUsageLogs] = useState<InventoryUsageLog[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);

  const [lotDialogOpen, setLotDialogOpen] = useState(false);
  const [lotForm, setLotForm] = useState(EMPTY_LOT_FORM);

  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [useForm, setUseForm] = useState(EMPTY_USAGE_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [itemsData, lotsData, categoriesData] = await Promise.all([
        inventoryService.listItems(),
        inventoryService.listLots(),
        inventoryService.listCategories(),
      ]);
      setItems(itemsData);
      setLots(lotsData);
      setCategories(categoriesData);

      const usageLists = await Promise.all(lotsData.map((lot) => inventoryService.listUsage(lot.id)));
      const flattened = usageLists.flat().sort((a, b) => (a.used_date < b.used_date ? 1 : -1));
      setUsageLogs(flattened);
    } catch {
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const usableLots = useMemo(
    () => lots.filter((l) => l.status === "in_use" && Number(l.current_quantity) > 0),
    [lots],
  );

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;
    setSaving(true);
    try {
      await inventoryService.createCategory(categoryForm);
      setCategoryDialogOpen(false);
      setCategoryForm(EMPTY_CATEGORY_FORM);
      await load();
    } catch {
      setError("Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async () => {
    if (!itemForm.item_code.trim() || !itemForm.name.trim() || !itemForm.category || !itemForm.unit.trim()) return;
    setSaving(true);
    try {
      await inventoryService.createItem({
        ...itemForm,
        minimum_stock: itemForm.minimum_stock || null,
      });
      setItemDialogOpen(false);
      setItemForm(EMPTY_ITEM_FORM);
      await load();
    } catch {
      setError("Failed to create inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLot = async () => {
    if (!lotForm.item || !lotForm.lot_number.trim() || !lotForm.initial_quantity) return;
    setSaving(true);
    try {
      await inventoryService.createLot({
        ...lotForm,
        expiry_date: lotForm.expiry_date || null,
        purity_percent: lotForm.purity_percent || null,
      });
      setLotDialogOpen(false);
      setLotForm(EMPTY_LOT_FORM);
      await load();
    } catch {
      setError("Failed to create inventory lot.");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordUsage = async () => {
    if (!useForm.lot || !useForm.quantity_used || !useForm.purpose.trim()) return;
    setSaving(true);
    try {
      await inventoryService.recordUsage(useForm.lot, {
        quantity_used: useForm.quantity_used,
        used_date: useForm.used_date,
        purpose: useForm.purpose,
        linked_sample: useForm.linked_sample || null,
      });
      setUseDialogOpen(false);
      setUseForm(EMPTY_USAGE_FORM);
      await load();
    } catch {
      setError("Failed to record item usage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Inventory Management</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<OutboxIcon />} onClick={() => setUseDialogOpen(true)}
            disabled={usableLots.length === 0}>
            Use Item
          </Button>
          {tab === 0 && (
            <>
              <Button variant="outlined" onClick={() => setCategoryDialogOpen(true)}>
                New Category
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setItemDialogOpen(true)}
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
                New Item
              </Button>
            </>
          )}
          {tab === 1 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setLotDialogOpen(true)}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
              New Lot
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E9ECEF" }}>
        <Tab label="Items" />
        <Tab label="Lots" />
        <Tab label="Usage Log" />
      </Tabs>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? <CircularProgress /> : tab === 0 ? (
        <ModuleTable columns={ITEM_COLUMNS} rows={items} />
      ) : tab === 1 ? (
        <ModuleTable columns={LOT_COLUMNS} rows={lots} />
      ) : (
        <ModuleTable columns={USAGE_COLUMNS} rows={usageLogs} />
      )}

      {/* New Category */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Inventory Category</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField label="Category Name" fullWidth required autoFocus value={categoryForm.name}
            onChange={(e) => setCategoryForm({ name: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCategory} disabled={saving || !categoryForm.name.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Item */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Inventory Item</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Item Code" fullWidth required autoFocus value={itemForm.item_code}
              onChange={(e) => setItemForm({ ...itemForm, item_code: e.target.value })} />
            <TextField label="Name" fullWidth required value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
          </Box>
          <TextField select label="Category" fullWidth required value={itemForm.category}
            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Manufacturer" fullWidth value={itemForm.manufacturer}
              onChange={(e) => setItemForm({ ...itemForm, manufacturer: e.target.value })} />
            <TextField label="Catalog No." fullWidth value={itemForm.catalog_no}
              onChange={(e) => setItemForm({ ...itemForm, catalog_no: e.target.value })} />
          </Box>
          <TextField label="Storage Condition" fullWidth placeholder="e.g. 2-8C" value={itemForm.storage_condition}
            onChange={(e) => setItemForm({ ...itemForm, storage_condition: e.target.value })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Unit" fullWidth required placeholder="e.g. g, mL, ea" value={itemForm.unit}
              onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
            <TextField label="Minimum Stock" type="number" fullWidth value={itemForm.minimum_stock}
              onChange={(e) => setItemForm({ ...itemForm, minimum_stock: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateItem}
            disabled={saving || !itemForm.item_code.trim() || !itemForm.name.trim() || !itemForm.category || !itemForm.unit.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Lot */}
      <Dialog open={lotDialogOpen} onClose={() => setLotDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>New Inventory Lot</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField select label="Item" fullWidth required autoFocus value={lotForm.item}
            onChange={(e) => setLotForm({ ...lotForm, item: e.target.value })}>
            {items.map((i) => <MenuItem key={i.id} value={i.id}>{i.item_code} — {i.name}</MenuItem>)}
          </TextField>
          <TextField label="Lot Number" fullWidth required value={lotForm.lot_number}
            onChange={(e) => setLotForm({ ...lotForm, lot_number: e.target.value })} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Received Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={lotForm.received_date} onChange={(e) => setLotForm({ ...lotForm, received_date: e.target.value })} />
            <TextField label="Expiry Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={lotForm.expiry_date} onChange={(e) => setLotForm({ ...lotForm, expiry_date: e.target.value })} />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Initial Quantity" type="number" fullWidth required value={lotForm.initial_quantity}
              onChange={(e) => setLotForm({ ...lotForm, initial_quantity: e.target.value })} />
            <TextField label="Purity %" type="number" fullWidth value={lotForm.purity_percent}
              onChange={(e) => setLotForm({ ...lotForm, purity_percent: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLotDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLot}
            disabled={saving || !lotForm.item || !lotForm.lot_number.trim() || !lotForm.initial_quantity}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use Item */}
      <Dialog open={useDialogOpen} onClose={() => setUseDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Use Item — Record Usage</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField select label="Lot" fullWidth required autoFocus value={useForm.lot}
            onChange={(e) => setUseForm({ ...useForm, lot: e.target.value })}>
            {usableLots.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.item_code} — Lot {l.lot_number} ({l.current_quantity} available)
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Quantity Used" type="number" fullWidth required value={useForm.quantity_used}
            onChange={(e) => setUseForm({ ...useForm, quantity_used: e.target.value })} />
          <TextField label="Used Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
            value={useForm.used_date} onChange={(e) => setUseForm({ ...useForm, used_date: e.target.value })} />
          <TextField label="Purpose" fullWidth required value={useForm.purpose}
            onChange={(e) => setUseForm({ ...useForm, purpose: e.target.value })} />
          <TextField label="Linked Sample ID (optional)" fullWidth value={useForm.linked_sample}
            onChange={(e) => setUseForm({ ...useForm, linked_sample: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecordUsage}
            disabled={saving || !useForm.lot || !useForm.quantity_used || !useForm.purpose.trim()}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
            Record Usage
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
