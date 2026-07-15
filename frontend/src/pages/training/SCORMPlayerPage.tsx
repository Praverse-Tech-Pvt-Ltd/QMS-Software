import { Box, Typography, Alert, CircularProgress, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { trainingService, type SCORMModule } from "../../services/training.service";
import api from "../../services/api";

export default function SCORMPlayerPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [scormModule, setScormModule] = useState<SCORMModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!assignmentId) return;
    (async () => {
      try {
        const assignment = await trainingService.getAssignment(assignmentId);
        const plan = await trainingService.getById(assignment.plan);
        if (!plan.scorm_module) {
          setError("This training plan has no SCORM package attached.");
          return;
        }
        setScormModule(plan.scorm_module);
        window.initSCORMSession?.(String(assignmentId), plan.scorm_module.id);
      } catch {
        setError("Failed to load this training assignment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId]);

  // Listen for LMSCommit/LMSFinish events dispatched by /scorm-api.js and
  // perform the actual authenticated POST here, in the React app's own
  // module scope — the SCORM content in the iframe never touches the token.
  useEffect(() => {
    const handleCommit = (e: WindowEventMap["scorm:commit"]) => {
      api.post("/training/scorm-results/", e.detail).catch(() => {
        enqueueSnackbar("Failed to save SCORM progress.", { variant: "error" });
      });
    };
    window.addEventListener("scorm:commit", handleCommit);
    return () => window.removeEventListener("scorm:commit", handleCommit);
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !scormModule) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || "SCORM module not found."}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/training")}>
          Back to Training
        </Button>
      </Box>
    );
  }

  // package_file is the uploaded package's own file URL (e.g. a .zip); launch_url
  // is a path *within* that package (e.g. "index.html"). This assumes the package
  // has been extracted server-side to a directory alongside package_file — that
  // extraction step does not exist yet in this backend (Phase 7 only stored the
  // raw upload). Until a future phase adds unzip-on-upload, this iframe src will
  // not resolve to real content; the URL is constructed correctly for when it does.
  const packageFileUrl = scormModule.package_file || "";
  const iframeSrc = packageFileUrl
    ? new URL(scormModule.launch_url, packageFileUrl).toString()
    : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderBottom: "1px solid #e2e8f0" }}>
        <IconButton onClick={() => navigate("/training")}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight={700}>{scormModule.title}</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={scormModule.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <Alert severity="warning" sx={{ m: 3 }}>
            No package file has been uploaded for this SCORM module yet.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
