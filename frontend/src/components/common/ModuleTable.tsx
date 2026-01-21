import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import type { WorkflowStatus } from "../../config/workflows";

import StatusChip from "../qms/StatusChip";

export type ModuleRow = {
  id: string;
  title: string;
  department: string;
  owner: string;
  status: WorkflowStatus;
  updatedAt: string;
};

export default function ModuleTable({
  rows,
  onView,
  onEdit,
  onClone,
}: {
  rows: ModuleRow[];
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onClone?: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  return (
    <Paper
      sx={{
        mt: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No records found.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>
                  <StatusChip status={row.status} />
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleOpen(e, row.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            if (selectedId) onView(selectedId);
            handleClose();
          }}
        >
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedId && onEdit) onEdit(selectedId);
            handleClose();
          }}
          disabled={!onEdit}
        >
          Edit (mock)
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedId && onClone) onClone(selectedId);
            handleClose();
          }}
          disabled={!onClone}
        >
          Clone (mock)
        </MenuItem>
      </Menu>
    </Paper>
  );
}
