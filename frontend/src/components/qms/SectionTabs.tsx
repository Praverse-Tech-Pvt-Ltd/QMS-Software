import { Box, Paper, Tab, Tabs } from "@mui/material";
import { type ReactNode, useState } from "react";

export type TabItem = {
  label: string;
  content: ReactNode;
};

export default function SectionTabs({ tabs }: { tabs: TabItem[] }) {
  const [value, setValue] = useState(0);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Tabs
        value={value}
        onChange={(_, v) => setValue(v)}
        sx={{ mb: 2 }}
      >
        {tabs.map((t) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>

      <Box>{tabs[value]?.content}</Box>
    </Paper>
  );
}
