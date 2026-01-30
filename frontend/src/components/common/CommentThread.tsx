import { 
  Box, Typography, Avatar, TextField, Button, Paper, Divider 
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";

interface Comment {
  id: string;
  author: string;
  avatar?: string; // Initials or URL
  text: string;
  timestamp: string;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  readOnly?: boolean;
}

export default function CommentThread({ comments, onAddComment, readOnly = false }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Discussion Thread
      </Typography>

      {/* Comment List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {comments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No comments yet. Start the discussion.
            </Typography>
        )}
        
        {comments.map((c) => (
          <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
               <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
                   {c.avatar || c.author.charAt(0)}
               </Avatar>
               <Box>
                   <Typography variant="subtitle2" fontWeight={700}>{c.author}</Typography>
                   <Typography variant="caption" color="text.secondary">{c.timestamp}</Typography>
               </Box>
            </Box>
            <Typography variant="body2" sx={{ ml: 5.5 }}>
                {c.text}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Input Area */}
      {!readOnly && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 40, height: 40 }}>ME</Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <TextField 
                    fullWidth 
                    multiline 
                    rows={2} 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button 
                        variant="contained" 
                        endIcon={<SendIcon />} 
                        onClick={handleSubmit}
                        disabled={!newComment.trim()}
                    >
                        Post Comment
                    </Button>
                </Box>
            </Box>
        </Box>
      )}
    </Box>
  );
}