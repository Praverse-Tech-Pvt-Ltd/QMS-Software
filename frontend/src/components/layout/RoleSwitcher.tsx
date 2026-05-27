import { FormControl, MenuItem, Select, Typography, Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { roles } from "../../services/permission.service";
import { useRole } from "../../app/providers/RoleProvider";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  // ✅ Fix 1: Add <string> generic to SelectChangeEvent
  const handleChange = (e: SelectChangeEvent<string>) => {
    setRole(e.target.value as any);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
        Role:
      </Typography>

      <FormControl size="small">
        {/* ✅ Fix 2: Handle null role with fallback string */}
        <Select value={role || ""} onChange={handleChange}>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}