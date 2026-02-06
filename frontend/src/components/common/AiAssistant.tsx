import { useState } from "react";
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your QMS AI Assistant. I can help you with document queries, compliance questions, and workflow guidance. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I understand your question. This is a simulated response. In production, this would connect to your AI backend service for intelligent QMS assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="ai assistant"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: "#6366F1",
          boxShadow: "0 8px 16px rgba(31, 111, 235, 0.3)",
          "&:hover": {
            bgcolor: "#4F46E5",
            boxShadow: "0 12px 24px rgba(31, 111, 235, 0.4)",
          },
        }}
      >
        <SmartToyOutlinedIcon />
      </Fab>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            borderLeft: "1px solid #E9ECEF",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#F7F8FA",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #E9ECEF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesomeOutlinedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#2D3339" }}
                >
                  QMS AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: "#858D96" }}>
                  Powered by AI
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseOutlinedIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  flexDirection: message.role === "user" ? "row-reverse" : "row",
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor:
                      message.role === "assistant" ? "#EEF2FF" : "#F3F4F6",
                    color: message.role === "assistant" ? "#6366F1" : "#5C6370",
                    fontSize: "0.875rem",
                  }}
                >
                  {message.role === "assistant" ? (
                    <SmartToyOutlinedIcon fontSize="small" />
                  ) : (
                    "U"
                  )}
                </Avatar>

                {/* Message Bubble */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: "75%",
                    borderRadius: 2,
                    bgcolor:
                      message.role === "assistant" ? "#FFFFFF" : "#EEF2FF",
                    border: "1px solid #E9ECEF",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2D3339",
                      lineHeight: 1.6,
                      fontSize: "0.875rem",
                    }}
                  >
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#858D96",
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#EEF2FF",
                    color: "#6366F1",
                  }}
                >
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E9ECEF",
                  }}
                >
                  <CircularProgress size={16} thickness={4} />
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#FFFFFF",
              borderTop: "1px solid #E9ECEF",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Ask me anything about QMS..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#FAFBFC",
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                sx={{
                  bgcolor: "#6366F1",
                  color: "#FFFFFF",
                  "&:hover": {
                    bgcolor: "#4F46E5",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#E9ECEF",
                    color: "#858D96",
                  },
                }}
              >
                <SendOutlinedIcon />
              </IconButton>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Paper
                elevation={0}
                onClick={() => setInput("What documents need review?")}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid #E9ECEF",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                    borderColor: "#6366F1",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#5C6370", fontWeight: 500 }}
                >
                  📋 Documents to review
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                onClick={() => setInput("Show my pending tasks")}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid #E9ECEF",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                    borderColor: "#6366F1",
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#5C6370", fontWeight: 500 }}
                >
                  ✅ My tasks
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
