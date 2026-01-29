import { Box,  Typography, Paper, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";

// ✅ 1. Update the interface
export interface AttachmentsUploaderProps {
  readOnly?: boolean;
  title?: string;            // New Prop
  acceptedFormats?: string;  // New Prop (e.g., ".pdf,.docx")
}

export default function AttachmentsUploader({ 
  readOnly = false,
  title = "Attachments",               // Default value
  acceptedFormats = ".pdf,.jpg,.png"   // Default value
}: AttachmentsUploaderProps) {
  
  // Mock State for files
  const [files, setFiles] = useState([
    { name: "evidence-photo.jpg", size: "1.2 MB", date: "2024-02-10" },
    { name: "investigation-report.pdf", size: "4.5 MB", date: "2024-02-12" }
  ]);

  const handleDelete = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
  };

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      
      {/* Upload Zone - Hidden if Read Only */}
      {!readOnly && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderStyle: "dashed",
            borderColor: "primary.main",
            bgcolor: "primary.50",
            textAlign: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "primary.100" }
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" color="primary.main" gutterBottom>
            Click or Drag to Upload
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title} (Max 10MB)
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
            Accepted: {acceptedFormats}
          </Typography>
        </Paper>
      )}

      {/* File List */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fafafa' }}>
           <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
             Attached Files ({files.length})
           </Typography>
        </Box>
        
        <List disablePadding>
          {files.map((file, index) => (
            <ListItem
              key={index}
              divider={index < files.length - 1}
              secondaryAction={
                !readOnly && (
                  <IconButton edge="end" size="small" onClick={() => handleDelete(file.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemIcon>
                <InsertDriveFileIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${file.size} • Uploaded ${file.date}`}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              />
            </ListItem>
          ))}
          
          {files.length === 0 && (
            <ListItem>
                <ListItemText 
                  primary="No attachments found." 
                  sx={{ textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }} 
                />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}