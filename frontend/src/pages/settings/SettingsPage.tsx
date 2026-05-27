import { Box, Typography, Paper, Tabs, Tab, Chip } from "@mui/material";
import { useState } from "react";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Section Components
import OrganizationSettings from "../../components/settings/OrganizationSettings";
import UsersAndRoles from "../../components/settings/UsersAndRoles";
import SystemDefaults from "../../components/settings/SystemDefaults";
import PermissionMatrix from "../../components/settings/PermissionMatrix";
import IntegrationsStatus from "../../components/settings/IntegrationsStatus";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const { role: rawRole } = useRole();
  const [activeTab, setActiveTab] = useState(0);

  // ✅ FIX: Provide a default string to satisfy TypeScript
  const role = rawRole || "Viewer"; 

  const canEdit = permissionService.can(role, 'settings', 'edit');
  const canView = permissionService.can(role, 'settings', 'view');

  const tabs = [
    { label: "Organization", component: <OrganizationSettings />, roles: ["Admin"] },
    { label: "Users & Roles", component: <UsersAndRoles />, roles: ["Admin", "QA"] },
    { label: "System Defaults", component: <SystemDefaults />, roles: ["Admin"] },
    { label: "Permissions", component: <PermissionMatrix />, roles: ["Admin"] },
    { label: "Integrations", component: <IntegrationsStatus />, roles: ["Admin", "QA"] },
  ];

  // ✅ Filter tabs with the guaranteed string role
  const availableTabs = tabs.filter(tab => tab.roles.includes(role));
  
  if (!canView || !rawRole) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" fontWeight={800}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          You do not have the required permissions to access system configurations.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>
            System Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Manage organization parameters and regulatory compliance
          </Typography>
        </Box>
        <Chip
          label={canEdit ? "Full Access" : "Read-Only"}
          color={canEdit ? "primary" : "default"}
          variant={canEdit ? "filled" : "outlined"}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                minHeight: 60,
              },
            }}
          >
            {availableTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 4, minHeight: 400 }}>
          {availableTabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}