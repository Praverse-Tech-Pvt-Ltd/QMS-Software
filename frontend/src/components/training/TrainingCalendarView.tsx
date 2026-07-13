import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, IconButton, Card, CardContent, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { trainingService, type CalendarAssignment } from "../../services/training.service";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function TrainingCalendarView() {
  const [cursor, setCursor] = useState(() => new Date());
  const [data, setData] = useState<Record<string, CalendarAssignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    trainingService.getCalendar(monthKey(cursor))
      .then(setData)
      .catch(() => setError("Failed to load training calendar."))
      .finally(() => setLoading(false));
  }, [cursor]);

  const weeks = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();

    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cursor]);

  const dayKey = (day: number) =>
    `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedAssignments = selectedDay ? data[selectedDay] || [] : [];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
        <IconButton onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ minWidth: 180, textAlign: "center" }}>
          {cursor.toLocaleString("default", { month: "long", year: "numeric" })}
        </Typography>
        <IconButton onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box> : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
              {WEEKDAYS.map((d) => (
                <Typography key={d} variant="caption" fontWeight={700} color="text.secondary" sx={{ textAlign: "center" }}>
                  {d}
                </Typography>
              ))}
            </Box>
            {weeks.map((week, wi) => (
              <Box key={wi} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
                {week.map((day, di) => {
                  if (day === null) return <Box key={di} />;
                  const key = dayKey(day);
                  const assignments = data[key] || [];
                  return (
                    <Box
                      key={di}
                      onClick={() => assignments.length && setSelectedDay(key)}
                      sx={{
                        minHeight: 64,
                        borderRadius: 2,
                        border: "1px solid #E9ECEF",
                        p: 0.75,
                        cursor: assignments.length ? "pointer" : "default",
                        bgcolor: assignments.length ? "#EEF2FF" : "transparent",
                        "&:hover": assignments.length ? { bgcolor: "#E0E7FF" } : {},
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>{day}</Typography>
                      {assignments.length > 0 && (
                        <Chip label={assignments.length} size="small"
                          sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#667eea", color: "white", mt: 0.5 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedDay} onClose={() => setSelectedDay(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Assignments Due — {selectedDay}</DialogTitle>
        <DialogContent>
          <List dense>
            {selectedAssignments.map((a) => (
              <ListItem key={a.id} divider>
                <ListItemText
                  primary={a.plan_title}
                  secondary={`${a.user} · ${a.status}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDay(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
