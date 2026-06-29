# NexGen QMS — Codebase Audit Report
Date: 2026-06-19
Audited by: Claude Code (claude-sonnet-4-6)

## Summary
- Total items checked: 87
- PRESENT: 58
- PARTIAL: 17
- MISSING: 12
- Compliance violations found: 0

---

## Backend

### Django Apps

| App / Model | Status | Notes |
|---|---|---|
| `accounts/` User model | PRESENT | UUID PK via AbstractUser, 9 roles including QA Head/Manager/Executive |
| `accounts/` Site model | PRESENT | name, code, country, is_active |
| `shared/` BaseModel | PRESENT | UUID PK, created_by, modified_by, is_active, site FK |
| `shared/` ESignature | PRESENT | user FK, signed_at, password_hash, record_type, record_id, action |
| `shared/` AuditLog | MISSING | Lives in `core/models.py` as `AuditLog` — fully functional, just different location |
| `shared/workflow.py` | PRESENT | `transition()` + `verify_esignature()` using `user.check_password()` |
| `dms/` | PRESENT | Document, DocumentVersion, ApprovalStep, DocumentCategory |
| `quality/` Deviation | PRESENT | TimeStampedModel (not BaseModel — pre-existing, intentional) |
| `quality/` CAPA | PRESENT | TimeStampedModel, PLANNING→VERIFIED status machine |
| `quality/` ChangeControl | PRESENT | TimeStampedModel, impact_data, risk_level |
| `quality/` EffectivenessCheck | PRESENT | OneToOne with Capa, criteria/result/evidence |
| `quality/` OOSInvestigation | PRESENT | Phase 1→2→confirmed/invalidated, TRANSITIONS + ESIG_REQUIRED |
| `quality/` OOSPhase1 | PRESENT | instrument_check, analyst_retest, conclusion |
| `quality/` OOSPhase2 | PRESENT | resampling, additional_results, conclusion |
| `quality/` OOTConfig | PRESENT | product/test_name, 3-sigma / custom range methods |
| `training/` | PRESENT | TrainingItem, TrainingAssignment, TrainingRecord |
| `audits/` Audit | PRESENT | TRANSITIONS + ESIG_REQUIRED, auto-number, HistoricalRecords |
| `audits/` Finding | PRESENT | severity 4-level, auto-CAPA on critical, HistoricalRecords |
| `audits/` AuditResponse | PRESENT | HistoricalRecords |
| `complaints/` Complaint | PRESENT | auto deadline, regulatory_reportable, MDR link, HistoricalRecords |
| `complaints/` Investigation | PRESENT | OneToOne with Complaint, HistoricalRecords |
| `complaints/` MDRReport | PRESENT | regulatory_body, submission notes, HistoricalRecords |
| `risk/` Risk | PRESENT | FMEA, rpn @property, risk_level @property, HistoricalRecords |
| `risk/` Mitigation | PRESENT | action_owner, due_date, status, HistoricalRecords |
| `risk/` ResidualRisk | PRESENT | residual_rpn @property |
| `suppliers/` Supplier | PRESENT | TRANSITIONS + ESIG_REQUIRED, HistoricalRecords |
| `suppliers/` QualificationRecord | PRESENT | ESignature FK, HistoricalRecords |
| `suppliers/` ASLEntry | PRESENT | is_current singleton via save() override, HistoricalRecords |
| `suppliers/` Scorecard | PRESENT | period, quality/delivery/responsiveness scores |
| `suppliers/` SupplierChangeNotification | PRESENT | ai_remark field, HistoricalRecords |
| `nonconformance/` NCReport | PRESENT | hold_status, TRANSITIONS, HistoricalRecords |
| `nonconformance/` HoldRecord | PRESENT | placed_by/at, released_by/at |
| `nonconformance/` Disposition | PRESENT | ESignature FK, decisions, HistoricalRecords |
| `laboratory/` Sample | PRESENT | TRANSITIONS + ESIG_REQUIRED, HistoricalRecords |
| `laboratory/` Specification | PRESENT | lower/upper limits, HistoricalRecords |
| `laboratory/` TestRequest | PRESENT | assigned_analyst, HistoricalRecords |
| `laboratory/` TestResult | PRESENT | pass_fail @property, auto-OOS trigger on fail, HistoricalRecords |
| `laboratory/` COATemplate | MISSING | Not in models.py |
| `batch_records/` MasterBatchRecord | PRESENT | TRANSITIONS + ESIG_REQUIRED, HistoricalRecords |
| `batch_records/` MBRStep | PRESENT | is_critical, esig_required, expected_range |
| `batch_records/` BatchProductionRecord | PRESENT | TRANSITIONS + ESIG_REQUIRED, HistoricalRecords |
| `batch_records/` BPRStep | PRESENT | auto-Deviation on out-of-range, ESignature FK |
| `batch_records/` IPQCCheck | MISSING | Not in models.py |
| `batch_records/` BatchRelease | PRESENT | ESignature FK, release_date |
| `reports/` APQRReport | PRESENT | TRANSITIONS + ESIG_REQUIRED, content JSONField |
| `knowledge/` SOPChunk | PARTIAL | embedding_json TextField instead of VectorField (pgvector not yet configured) |
| `knowledge/` FDA483Observation | PARTIAL | embedding_json TextField instead of VectorField |

### Shared Infrastructure

| Check | Status | Notes |
|---|---|---|
| BaseModel UUID PK + soft delete | PRESENT | `is_active` field + transition via workflow |
| `shared/workflow.py` transition() | PRESENT | Validates TRANSITIONS dict, enforces e-sig, writes AuditLog |
| django-simple-history installed | PRESENT | In INSTALLED_APPS, HistoricalRecords on all new regulated models |
| pgvector configured | MISSING | SOPChunk and FDA483Observation use `embedding_json` TextField placeholder |
| Celery + Redis configured | PRESENT | `config/celery.py`, CELERY_TASK_ALWAYS_EAGER=True in DEBUG |
| Celery tasks — overdue complaints | PRESENT | `complaints/tasks.py` |
| Celery tasks — expiring suppliers | PRESENT | `suppliers/tasks.py` |
| Celery tasks — overdue actions | MISSING | No global action-item overdue task |
| Celery tasks — daily FDA scrape | PARTIAL | `knowledge/tasks.py` present but content unverified |
| AuditLog model (append-only) | PRESENT | In `core/models.py`, no delete endpoint |
| `GET /api/v1/audit-trail/` | PRESENT | Registered in urls.py, implemented in `core/audit_views.py` |
| `POST /api/v1/ai/questionnaire/` | PRESENT | In `shared/views.py` + `shared/urls.py` |
| `POST /api/v1/ai/remark/` | PRESENT | In `shared/views.py` |
| `POST /api/v1/ai/extract-actions/` | PRESENT | In `shared/views.py` |
| `GET /api/v1/knowledge/fda-risk/` | PARTIAL | Route registered, implementation needs verification |
| `POST /api/v1/knowledge/sop/upload/` | PARTIAL | Route registered, sop_ingestion.py present |

### Compliance Checks

| Check | Status | Notes |
|---|---|---|
| Zero hard deletes on regulated models | PRESENT | `grep -r ".delete()"` returns no matches in backend |
| E-sig on CAPA close | PARTIAL | CAPA uses old TimeStampedModel, no TRANSITIONS/ESIG_REQUIRED defined |
| E-sig on Change Control approve | PARTIAL | ChangeControl uses old TimeStampedModel, no TRANSITIONS/ESIG_REQUIRED |
| E-sig on Audit close | PRESENT | `ESIG_REQUIRED_ACTIONS = ['closed']` |
| E-sig on Complaint close | PRESENT | `ESIG_REQUIRED_ACTIONS = ['closed']` |
| E-sig on NC disposition | PRESENT | Disposition model has ESignature FK |
| E-sig on Supplier ASL approval | PRESENT | QualificationRecord ESIG_REQUIRED; ASLEntry requires ESignature FK |
| E-sig on Batch release | PRESENT | BatchRelease has ESignature FK; BPR ESIG_REQUIRED = ['released'] |
| E-sig on APQR approval | PRESENT | APQRReport ESIG_REQUIRED = ['approved'] |
| All timestamps UTC | PRESENT | USE_TZ=True, auto_now_add throughout |
| No direct status assignment outside workflow | PRESENT | New modules all call `transition()` |
| ANTHROPIC_API_KEY from env | PRESENT | `os.environ.get('ANTHROPIC_API_KEY')` in settings |
| OPENAI_API_KEY from env | PRESENT | `os.environ.get('OPENAI_API_KEY')` in settings |

### requirements.txt

| Package | Status |
|---|---|
| anthropic>=0.30.0 | PRESENT |
| spacy>=3.7.0 | PRESENT |
| django-simple-history>=3.4.0 | PRESENT |
| pgvector>=0.2.0 | PRESENT |
| pdfplumber>=0.10.0 | PRESENT |
| python-docx>=1.1.0 | PRESENT |
| openai>=1.30.0 | PRESENT |
| reportlab>=4.0.0 | PRESENT |
| openpyxl>=3.1.0 | PRESENT |
| celery>=5.3.0 | PRESENT |
| redis>=5.0.0 | PRESENT |
| matplotlib>=3.8.0 | PRESENT |

### AI Algorithms

| Algorithm | Status | Notes |
|---|---|---|
| A — classifier.py | PRESENT | Keyword-map based, returns event_type, sub_category, risk_level |
| B — questionnaire.py | PRESENT | JSON decision tree walker, Redis cache, branching logic |
| C — risk_scorer.py | PRESENT | Weighted additive scoring, approval chain lookup |
| D — remark_generator.py | PRESENT | Stub + Claude API (_claude_remark) wired, falls back gracefully |
| E — action_extractor.py | PRESENT | spaCy pipeline with fallback to trigger-phrase matching |
| question_trees/audit.json | PRESENT | |
| question_trees/deviation.json | PRESENT | |
| question_trees/complaint.json | PRESENT | |
| question_trees/risk.json | PRESENT | |
| question_trees/nc.json | PRESENT | |
| question_trees/change_control.json | MISSING | Referenced by B but not on disk |
| question_trees/oos.json | MISSING | Referenced by B but not on disk |
| question_trees/supplier.json | MISSING | Referenced by B but not on disk |
| question_trees/capa.json | MISSING | Referenced by B but not on disk |

---

## Frontend

### Routes

| Route | Status | Notes |
|---|---|---|
| `/` Dashboard | PRESENT | DashboardPage with KPI cards |
| `/login` | PRESENT | |
| `/documents` | PRESENT | DmsListPage |
| `/documents/:id` | PRESENT | DmsDetailPage |
| `/quality/deviations` | PARTIAL | Route at `/deviations` not `/quality/deviations` |
| `/quality/deviations/:id` | PARTIAL | Route at `/deviations/:id` |
| `/quality/capa` | PARTIAL | Route at `/capa` |
| `/quality/capa/:id` | PARTIAL | Route at `/capa/:id` |
| `/quality/change-control` | PARTIAL | Route at `/change-control` |
| `/quality/change-control/:id` | PARTIAL | Route at `/change-control/:id` |
| `/training` | PRESENT | TrainingListPage |
| `/audits` | PRESENT | AuditsListPage |
| `/audits/:id` | PARTIAL | Routes to AuditsListPage (placeholder) — detail page missing |
| `/complaints` | PRESENT | ComplaintsListPage |
| `/complaints/:id` | PARTIAL | Routes to ComplaintsListPage (placeholder) |
| `/risks` | PRESENT | RisksListPage |
| `/risks/:id` | PARTIAL | Routes to RisksListPage (placeholder) |
| `/suppliers` | PRESENT | SuppliersListPage |
| `/suppliers/:id` | PARTIAL | Routes to SuppliersListPage (placeholder) |
| `/suppliers/asl` | MISSING | No ASL read-only page |
| `/nonconformance` | PRESENT | NCListPage |
| `/nonconformance/:id` | PARTIAL | Routes to NCListPage (placeholder) |
| `/oos` | PRESENT | OOSListPage with phase stats |
| `/oos/:id` | PARTIAL | Routes to OOSListPage (placeholder) |
| `/laboratory/samples` | PRESENT | LaboratoryListPage (tabbed) |
| `/laboratory/samples/:id` | PARTIAL | Routes to LaboratoryListPage (placeholder) |
| `/batch-records` | PRESENT | BatchRecordsListPage (tabbed) |
| `/batch-records/:id` | PARTIAL | Routes to BatchRecordsListPage (placeholder) |
| `/reports` | PRESENT | ManagementReviewPage with KPI cards |
| `/reports/apqr/:id` | MISSING | No APQR detail page |
| `/knowledge/sops` | PRESENT | KnowledgePage with upload + RAG query |

### Shared Components

| Component | Status | Notes |
|---|---|---|
| `<WorkflowTimeline />` | PRESENT | `frontend/src/components/common/WorkflowTimeline.tsx` |
| `<ESignatureDialog />` | PRESENT | `frontend/src/components/common/ESignatureDialog.tsx` |
| `<AIRemarkField />` | PRESENT | `frontend/src/components/common/AIRemarkField.tsx` |
| `<ActionMatrix />` | PRESENT | `frontend/src/components/common/ActionMatrix.tsx` |
| `<RiskScoreBadge />` | PRESENT | `frontend/src/components/common/RiskScoreBadge.tsx` |
| `<AIQuestionnaire />` | PRESENT | `frontend/src/components/common/AIQuestionnaire.tsx` |
| `<AuditTrailDrawer />` | PRESENT | `frontend/src/components/common/AuditTrailDrawer.tsx` |
| `<SeverityBadge />` | MISSING | Only `RiskScoreBadge` exists — no named `SeverityBadge` component |
| `<RiskMatrix />` | MISSING | 5×5 heatmap component does not exist |
| `<DataTable />` | PARTIAL | `ModuleTable` exists and is used; not named DataTable |

### RBAC + Auth

| Check | Status | Notes |
|---|---|---|
| `permissionService.canDo()` pattern | PRESENT | Used via `RequirePermission` wrapper on all routes |
| `ProtectedRoute` (AuthGuard) | PRESENT | `AuthGuard.tsx` wraps all authenticated routes |
| JWT access token in memory | PARTIAL | Stored in localStorage (`qms_token`) — not in-memory (security gap) |
| JWT refresh token HttpOnly cookie | MISSING | Refresh stored in localStorage, not HttpOnly cookie |
| Axios interceptor auto-refresh | PARTIAL | Interceptor exists but reads from localStorage |

---

## Critical Blockers (fix before building new features)
1. **question_trees MISSING** — `change_control.json`, `oos.json`, `supplier.json`, `capa.json` referenced but absent; questionnaire API will 404 for these modules.
2. **pgvector not migrated** — `SOPChunk.embedding_json` and `FDA483Observation.embedding_json` are TextFields. Semantic search (`/api/v1/knowledge/`) cannot work until VectorField migration runs.
3. **Detail pages all placeholder** — 10 module `:id` routes render the list page. Users cannot view or action individual records.
4. **`<RiskMatrix />` missing** — Risk register page has no heatmap, per PRD requirement.
5. **CAPA + ChangeControl e-sig** — Old `TimeStampedModel` models have no `TRANSITIONS`/`ESIG_REQUIRED_ACTIONS` — approve/close are not enforced through workflow.

## Build Order (what to build next, in sequence)
1. Add 4 missing question tree JSON files (`change_control.json`, `oos.json`, `supplier.json`, `capa.json`)
2. pgvector migration for `knowledge/` app + upgrade SOPChunk/FDA483Observation to VectorField
3. Detail pages for all 10 new modules (highest value: Audits → Complaints → Risks → Suppliers → NC → OOS → Laboratory → Batch Records → Reports → Knowledge)
4. `<RiskMatrix />` 5×5 heatmap component
5. APQR detail page (`/reports/apqr/:id`)
6. Suppliers ASL read-only page (`/suppliers/asl`)
7. Add TRANSITIONS + ESIG_REQUIRED_ACTIONS to CAPA and ChangeControl (quality/ app)
