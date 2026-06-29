import {
  Box, Typography, Button, TextField, CircularProgress, Alert,
  Card, CardContent, Chip, LinearProgress, Divider, Tabs, Tab,
  Table, TableHead, TableBody, TableRow, TableCell, Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useEffect, useRef, useState } from "react";
import {
  knowledgeService,
  type SOPChunk,
  type SOPListItem,
  type FDA483Observation,
} from "../../services/knowledge.service";

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#D1FAE5", color: "#065F46" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  High: { bg: "#FFEDD5", color: "#9A3412" },
  Critical: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function KnowledgePage() {
  const [tab, setTab] = useState(0);

  // --- SOP upload state ---
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [sopName, setSopName] = useState("");
  const [sopVersion, setSopVersion] = useState("1.0");
  const [sopDepartment, setSopDepartment] = useState("");
  const [sopEffectiveDate, setSopEffectiveDate] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- SOP list state ---
  const [sops, setSops] = useState<SOPListItem[]>([]);
  const [sopsLoading, setSopsLoading] = useState(true);

  // --- SOP query state ---
  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [results, setResults] = useState<SOPChunk[]>([]);

  // --- FDA 483 search state ---
  const [fdaQuery, setFdaQuery] = useState("");
  const [fdaSearching, setFdaSearching] = useState(false);
  const [fdaResults, setFdaResults] = useState<FDA483Observation[]>([]);

  const [error, setError] = useState<string | null>(null);

  const loadSOPs = () => {
    setSopsLoading(true);
    knowledgeService.listSOPs()
      .then(setSops)
      .catch(() => setSops([]))
      .finally(() => setSopsLoading(false));
  };

  useEffect(() => { loadSOPs(); }, []);

  const handleFileChosen = (file: File) => {
    setPendingFile(file);
    if (!sopName) setSopName(file.name.replace(/\.(pdf|docx|txt)$/i, ""));
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    try {
      const res = await knowledgeService.uploadSOP(pendingFile, setUploadProgress, {
        sop_name: sopName || pendingFile.name,
        version: sopVersion,
        department: sopDepartment,
        effective_date: sopEffectiveDate,
      });
      setUploadResult(`Uploaded successfully — ${res.chunks_created} chunks indexed.`);
      setPendingFile(null);
      setSopName(""); setSopVersion("1.0"); setSopDepartment(""); setSopEffectiveDate("");
      if (fileRef.current) fileRef.current.value = "";
      loadSOPs();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQuerying(true);
    setResults([]);
    try {
      const res = await knowledgeService.querySOP(query);
      setResults(res.results);
    } catch {
      setError("Query failed.");
    } finally {
      setQuerying(false);
    }
  };

  const handleFdaSearch = async () => {
    if (!fdaQuery.trim()) return;
    setFdaSearching(true);
    setFdaResults([]);
    try {
      const res = await knowledgeService.getFDARisk(fdaQuery);
      setFdaResults(res);
    } catch {
      setError("FDA 483 search failed.");
    } finally {
      setFdaSearching(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <AutoAwesomeIcon sx={{ color: "#667eea", fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>Knowledge Base</Typography>
          <Typography variant="body2" color="text.secondary">
            SOP library, semantic search, and FDA 483 / Warning Letter intelligence.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {uploadResult && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUploadResult(null)}>{uploadResult}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid #e2e8f0" }}>
        <Tab label="SOP Library" />
        <Tab label="Ask a Question" />
        <Tab label="FDA 483 / Warning Letters" />
      </Tabs>

      {tab === 0 && (
        <>
          <Card sx={{ mb: 3, borderRadius: 3, border: "2px dashed #C7D2FE" }}>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom textAlign="center">
                Upload SOP Document
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                Supported: PDF, DOCX
              </Typography>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <input ref={fileRef} type="file" accept=".pdf,.docx" hidden
                  onChange={(e) => e.target.files?.[0] && handleFileChosen(e.target.files[0])} />
                <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileRef.current?.click()}>
                  {pendingFile ? pendingFile.name : "Choose File"}
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="SOP Name" fullWidth size="small" value={sopName}
                    onChange={(e) => setSopName(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Version" fullWidth size="small" value={sopVersion}
                    onChange={(e) => setSopVersion(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Department" fullWidth size="small" value={sopDepartment}
                    onChange={(e) => setSopDepartment(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Effective Date" type="date" fullWidth size="small"
                    InputLabelProps={{ shrink: true }} value={sopEffectiveDate}
                    onChange={(e) => setSopEffectiveDate(e.target.value)} />
                </Grid>
              </Grid>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button variant="contained" onClick={handleUpload} disabled={uploading || !pendingFile}
                  sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
                  {uploading ? "Uploading..." : "Upload & Index"}
                </Button>
              </Box>
              {uploading && <LinearProgress value={uploadProgress} variant="determinate" sx={{ mt: 2, borderRadius: 2 }} />}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ p: 2, pb: 0 }}>Indexed SOPs</Typography>
              {sopsLoading ? (
                <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={24} /></Box>
              ) : sops.length === 0 ? (
                <Box sx={{ p: 3 }}><Alert severity="info">No SOPs indexed yet.</Alert></Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 700 }}>SOP Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Effective Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Chunks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Uploaded By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sops.map((s, i) => (
                      <TableRow key={`${s.sop_name}-${s.version}-${i}`} hover>
                        <TableCell><Typography variant="body2" fontWeight={500}>{s.sop_name}</Typography></TableCell>
                        <TableCell>{s.version}</TableCell>
                        <TableCell>{s.department || "—"}</TableCell>
                        <TableCell>{s.effective_date || "—"}</TableCell>
                        <TableCell>{s.chunk_count}</TableCell>
                        <TableCell>{s.uploaded_by || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Ask a Question</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth size="small" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. What are the temperature requirements for storage?" onKeyDown={(e) => e.key === "Enter" && handleQuery()} />
              <Button variant="contained" onClick={handleQuery} disabled={querying || !query.trim()}
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" }, minWidth: 100 }}>
                {querying ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              </Button>
            </Box>

            {results.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {results.length} relevant section(s) found:
                </Typography>
                {results.map((chunk, i) => (
                  <Box key={chunk.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Chip label={chunk.source_filename} size="small"
                        sx={{ bgcolor: "#EEF2FF", color: "#667eea", fontSize: "0.68rem" }} />
                      <Chip label={`§ ${chunk.chunk_index + 1}`} size="small" sx={{ fontSize: "0.68rem" }} />
                      {chunk.similarity !== undefined && (
                        <Chip label={`${(chunk.similarity * 100).toFixed(0)}% match`} size="small"
                          sx={{ bgcolor: "#D1FAE5", color: "#065F46", fontSize: "0.68rem" }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 2, fontSize: "0.82rem", lineHeight: 1.6 }}>
                      {chunk.text}
                    </Typography>
                    {i < results.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>FDA 483 / Warning Letter Search</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Search historical FDA inspection citations to assess risk before approving a CAPA, deviation, or change.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth size="small" value={fdaQuery} onChange={(e) => setFdaQuery(e.target.value)}
                placeholder="e.g. data integrity, cleaning validation, sterility" onKeyDown={(e) => e.key === "Enter" && handleFdaSearch()} />
              <Button variant="contained" onClick={handleFdaSearch} disabled={fdaSearching || !fdaQuery.trim()}
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" }, minWidth: 100 }}>
                {fdaSearching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              </Button>
            </Box>

            {fdaResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                {fdaResults.map((obs, i) => {
                  const rc = RISK_COLORS[obs.risk_level] || { bg: "#F3F4F6", color: "#374151" };
                  return (
                    <Box key={obs.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip label={obs.citation_number} size="small"
                          sx={{ bgcolor: "#EEF2FF", color: "#667eea", fontSize: "0.68rem" }} />
                        {obs.facility_type && (
                          <Chip label={obs.facility_type} size="small" sx={{ fontSize: "0.68rem" }} />
                        )}
                        {obs.date_issued && (
                          <Chip label={obs.date_issued} size="small" sx={{ fontSize: "0.68rem" }} />
                        )}
                        <Chip label={obs.risk_level} size="small"
                          sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: "0.68rem" }} />
                      </Box>
                      <Typography variant="body2" sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 2, fontSize: "0.82rem", lineHeight: 1.6 }}>
                        {obs.description}
                      </Typography>
                      {i < fdaResults.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  );
                })}
              </Box>
            )}
            {!fdaSearching && fdaResults.length === 0 && fdaQuery && (
              <Alert severity="info" sx={{ mt: 2 }}>No matching FDA citations found.</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
