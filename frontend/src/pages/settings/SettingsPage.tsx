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
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState(0);

  const canEdit = permissionService.can(role, 'settings', 'edit');
  const canView = permissionService.can(role, 'settings', 'view');

  // Define available tabs based on role
  const tabs = [
    { label: "Organization", component: <OrganizationSettings />, roles: ["Admin"] },
    { label: "Users & Roles", component: <UsersAndRoles />, roles: ["Admin", "QA"] },
    { label: "System Defaults", component: <SystemDefaults />, roles: ["Admin"] },
    { label: "Permissions", component: <PermissionMatrix />, roles: ["Admin"] },
    { label: "Integrations", component: <IntegrationsStatus />, roles: ["Admin", "QA"] },
  ];

  // Filter tabs based on role access
  const availableTabs = tabs.filter(tab => tab.roles.includes(role));
  
  if (!canView) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You do not have permission to view Settings.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>
            System Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Configure system parameters, user access, and compliance settings
          </Typography>
        </Box>
        <Chip
          label={canEdit ? "Editor Access" : "Read-Only"}
          color={canEdit ? "primary" : "default"}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Settings Container */}
      <Paper
        sx={{
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 56,
              },
            }}
          >
            {availableTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 4 }}>
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