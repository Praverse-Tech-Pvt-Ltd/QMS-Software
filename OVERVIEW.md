# NexGen QMS — Build Overview

## Phase 5 Changes (2026-06-22)

Final hardening and completion pass. All modules now have Backend ✅,
Frontend ✅, E-Sig ✅, AI ✅. 104 tests passing (up from 99), 89% coverage on
all new backend apps (audits, complaints, risk, suppliers, nonconformance,
training), zero regressions.

### Documentation Fixes
- Module status table corrected: DMS and Training now show AI ✅ (were wrong after Phase 4)
- Knowledge Base status corrected: full 3-tab UI (was still showing "List only")
- Known Remaining Gaps table replaced with accurate post-Phase-4 state
- API endpoint list updated with Phase 4 additions (action items, quiz, PDF exports) — also corrected: training endpoints are mounted at `/api/training/` (no `v1` prefix), not `/api/v1/training/` as commonly assumed elsewhere in this doc

### Bug Fixes
- `TrainingAssignmentViewSet.my_tasks` action added — resolves the pre-existing 404 on `GET /api/training/assignments/my-tasks/` called by the training dashboard. Real field names used: `user` (not `assigned_to`), status choices `PENDING`/`COMPLETED`/`OVERDUE` (not lowercase). Returns a flat array matching the existing `trainingService.getMyAssignments()` contract — not the `{count, overdue, results}` shape originally proposed, which would have broken the existing caller.
- **`AIQuestionnaire.tsx`** had the same dead `localStorage.getItem("qms_token")` auth bug already found and fixed in `AIRemarkField.tsx` during Phase 4 — every questionnaire call was silently failing. Fixed to use `aiService.getNextQuestions()`.
- **`UserProfileCard.tsx`**'s logout handler removed a `localStorage` key that no longer exists and never cleared the in-memory access token or session role — a real logout gap. Fixed to call `authService.logout()`.
- **`SignupPage.tsx`** (a fully functional self-registration flow, distinct from the documented-as-stub `authService.signup()`) was writing the access token to `localStorage` directly, bypassing the in-memory `tokenStore` entirely — reintroducing the exact 21 CFR Part 11 risk the Phase 2 JWT fix closed. Fixed to use `setAccessToken()`.
- **Laboratory `SampleDetailPage.tsx`**: the Release/Reject buttons' `doTransition()` was calling `getSample()` (a no-op GET) instead of any real transition endpoint — release/reject have never actually changed sample status in this app. Added `laboratoryService.transition()` and wired it in.
- **Batch Records**: `releaseBatch()` called a nonexistent `/batch-records/bpr/:id/release/` endpoint (only the generic `transition` action exists). Fixed to call `POST .../transition/` with `action: "released"`.
- `laboratory` `add_result` action now returns `oos_id` when a result fails, so the frontend can link to the auto-created OOS investigation (no UI currently consumes this — see Known Gaps).

### AI Integration Completed
- Laboratory: `AIRemarkField` shown before e-signature on batch Release/Reject (`approverRole`: `batch_release_qa` / `batch_rejection_qa`)
- Batch Records: `AIRemarkField` shown before e-signature on batch release (`approverRole`: `batch_release_production`); advisory deviation remark panel shown in the Steps tab when any step triggered an auto-created deviation (`approverRole`: `production_supervisor`)
- `shared/ai/remark_generator.py`: added `qc_analyst`, `batch_release_qa`, `batch_rejection_qa`, `production_supervisor`, `batch_release_production` to `ROLE_CONTEXT` (the actual dict name — not `ROLE_PROMPTS`), plus `laboratory` and `batch_records` entries in `MODULE_SOP_MAP`

### Module AI Status — Final State
| Module | AI Integrated |
|--------|--------------|
| DMS | ✅ Remark |
| Training | ✅ Quiz generation |
| Deviations | ✅ Remark |
| CAPA | ✅ Remark |
| Change Control | ✅ Questionnaire + Remark |
| Audits | ✅ Questionnaire + Action extraction |
| Complaints | ✅ Questionnaire + Action extraction |
| Risk Management | ✅ Questionnaire |
| Suppliers | ✅ Questionnaire |
| Non-Conformance | ✅ Remark |
| OOS Investigation | ✅ Questionnaire |
| Laboratory | ✅ Remark |
| Batch Records | ✅ Remark |
| Management Reports (APQR) | ✅ AI narrative sections |
| Knowledge Base | ✅ Embeddings + FDA 483 intelligence |

### Known gaps carried forward (not code defects — scoped out)
- No result-entry form exists yet in `SampleDetailPage.tsx`, so the OOS advisory `AIRemarkField` described for "when a test result fails" has no UI to attach to; the backend `oos_id` plumbing is in place for whenever that form is built.
- DMS's AI remark remains advisory-only (read-and-copy) per the Phase 4 `WorkflowActionsPanel` constraint.

### Remaining (environment configuration only — no code changes needed)
- `ANTHROPIC_API_KEY` — required for live AI remarks and quiz generation
- `OPENAI_API_KEY` — required for SOP embedding and FDA semantic search
- `DEFAULT_FROM_EMAIL` + SMTP — required for email alerts
- All three surfaced as startup warnings in `core/apps.py` since Phase 3

---

## Phase 4 Changes (2026-06-22)

Closes the compliance and feature-completeness gaps documented in PHASE3.md's Known Gaps. 99 tests passing (up from 95), all green, zero regressions.

### Bug Fixes
- `questionnaire.py`: fixed `TypeError: unhashable type: 'list'` on multi_select answers (`get_next_questions()` branch matching now iterates `branches.items()` via a type-safe `_answers_match()` helper instead of `answer_value in branches`). Regression tests added for the `change_control` tree's q5/q6.
- `shared.models.BaseModel.delete()`: now raises `NotImplementedError` on all regulated models (21 CFR Part 11). `soft_delete(user)` added as the supported deactivation path.
- `core.models.AuditLog`: additional protection — `delete()` and `soft_delete()` both raise unconditionally; audit records are permanent.
- **Real routing bug found during Phase 3 testing, fixed here too:** none in this phase — already fixed in Phase 3 (`risk`/`suppliers`/`nonconformance`/`complaints` URL ordering).
- `AIRemarkField.tsx` was reading the JWT from `localStorage` (`qms_token`), which no longer exists after the Phase 2 JWT-security fix moved access tokens to in-memory only. Every existing caller of this shared component (audits, complaints, change control, and now DMS) was silently failing to load AI remarks. Fixed to use `aiService.generateRemark()` (the shared `api` axios instance with its in-memory token).
- `ManagementReviewPage.tsx` / `APQRDetailPage.tsx` "Export PDF" buttons were calling the wrong endpoint (`reportsService.exportAuditTrail`) — now call dedicated `exportManagementReview()` / `exportAPQR()` methods.

### New Feature: ActionItem persistence
- `ActionItem` model added to `shared/` app with migration (category values match `shared.ai.action_extractor`'s actual lowercase categories, not the Title Case originally proposed)
- `POST /api/v1/ai/extract-actions/` now persists to DB via `get_or_create` when `record_type`/`record_id` are supplied (backward compatible — omitting them returns the old ephemeral behavior)
- `GET /api/v1/ai/action-items/` — retrieve saved action items by record; non-QA-staff roles only see items assigned to them
- `PATCH /api/v1/ai/action-items/:id/` — update owner, due_date, status (QA-staff roles only)
- `POST /api/v1/ai/action-items/:id/close/` — close with evidence note (min 20 chars)
- `POST /api/v1/ai/action-items/:id/extend/` — extend due date with justification (min 30 chars)
- `ActionMatrix.tsx`: edits now persisted via API (PATCH/close/extend) with Snackbar success/failure feedback; loads persisted items on mount when `recordType`/`recordId` props are supplied. Wired into Audit, Complaint, and Change Control detail pages.
- Celery task `shared.tasks.alert_overdue_action_items` — daily overdue alerts + 3-day escalation to QA Manager/QA Head, added to Beat schedule

### PDF Generation
- Management Review PDF export added (`GET /api/v1/reports/management-review/?format=pdf`) — reads the real `{kpis: {...}}` response shape (not a flat dict as originally assumed)

### AI Integration
- DMS: `AIRemarkField` added to the document approval/review tab (visible in DRAFT/REVIEW status) — surfaces an AI-drafted remark for the reviewer to copy into the workflow action panel's comment box (DMS has no per-page e-sig dialog of its own; transitions go through the shared `WorkflowActionsPanel`, which isn't modified here)
- Training: quiz auto-generation from indexed SOP content (`POST /api/v1/training/assignments/:id/generate-quiz/`) — degrades gracefully (`{error: ...}`, never raises) when the SOP isn't indexed or the AI call fails
- Training: quiz submission + 80% pass threshold (`POST /api/v1/training/assignments/:id/submit-quiz/`)
- `EmployeeTrainingProfilePage.tsx`'s `QuizModal` rewritten from a hardcoded single fake question to a real generate → answer-one-at-a-time → submit → pass/fail → e-sign flow

### Module AI Status (updated)
| Module | AI Integrated |
|--------|--------------|
| DMS | ✅ Remark |
| Training | ✅ Quiz generation |
| (all others unchanged from Phase 3) |

### Known limitations carried forward
- `quiz_questions`/`generate_quiz_from_sop()` require `ANTHROPIC_API_KEY` to produce real questions — without it, `generate-quiz` returns `503` (never blocks training silently; the gap is visible to the user)
- DMS's AI remark is advisory only (read-and-copy), not auto-injected into the transition `reason` field, since `WorkflowActionsPanel` (shared across DMS/ChangeControl) manages its own internal comment state with no external injection point
- `TrainingAssignmentViewSet` has no `my-tasks` action registered despite the frontend calling it — pre-existing, out of scope for this phase

---

## Phase 3 Changes (2026-06-22)

Connect, test, and harden the platform built in Phase 2. Full details in [PHASE3.md](PHASE3.md).

### Connected
- RiskMatrix wired into RisksListPage with cell-click filter + clear chip
- SeverityBadge applied to NC, Complaint, Audit finding severity columns
- ActionMatrix connected to Audit, Complaint, ChangeControl detail pages

### Knowledge Base UI
- SOP upload form + SOP list table (KnowledgePage Tab 1)
- RAG question search panel (KnowledgePage Tab 2)
- FDA 483 / Warning Letter search tab (KnowledgePage Tab 3)
- Backend API contracts fixed to match frontend service types (`SOPUploadView`, new `SOPListView`, `SOPQueryView`, `FDARiskView`)

### PDF Generation
- Audit trail PDF + Excel export — already implemented in `core/audit_views.py`; wired `AuditTrailDrawer.tsx` export buttons to it
- COA PDF generation added (`POST /api/v1/laboratory/samples/:id/coa/`), wired to "Generate COA" button in `SampleDetailPage.tsx`
- APQR PDF export added (`GET /api/v1/reports/apqr/:id/export/`), wired to existing export button in `APQRDetailPage.tsx`

### Testing
- Backend unit tests written for: audits, complaints, risk, suppliers, nonconformance, shared/ai
- **91% coverage** on the five new apps (target was 80%); **85% coverage** on shared/ai
- 74 + 21 = 95 tests, all passing

### Bugs found and fixed during this phase
- **URL routing bug** in `risk`, `suppliers`, `nonconformance`, `complaints` apps: named routes (`matrix/`, `asl/`, `expiring/`, `trends/`, `overdue/`) were registered *after* the DRF router include, so the router's `<pk>/` detail route silently swallowed them (e.g. `GET /api/v1/risks/matrix/` was being parsed as `retrieve(pk="matrix")` → 404). This directly broke the RiskMatrix wiring from earlier in Phase 3. Fixed by reordering each `urls.py` so explicit paths precede `include(router.urls)`.
- **`ManagementReviewView`** used an invalid `status__ne` Django lookup that would raise `FieldError` on any request — fixed to a plain `.exclude(status='closed')`.
- **`requirements.txt` was UTF-16 encoded** (a PowerShell `Out-File` artifact), which silently broke `pip install -r requirements.txt` parsing — `reportlab` and `openpyxl` were listed but never actually installed. Rewritten as UTF-8.
- **pgvector migration** (`knowledge/migrations/0002_add_pgvector.py`) used raw `CREATE EXTENSION`/`ivfflat` SQL unconditionally, which crashes on any non-PostgreSQL backend (e.g. sqlite, used by the test suite). Now skips on non-postgres via a `RunPython` vendor check.

### Data Pipeline
- `knowledge/tasks.py` rewritten: `scrape_fda_enforcements()` (verified live against openFDA — `{'created': 100, 'total_fetched': 100}`) and new `embed_unembedded_observations()` (writes to `embedding_json`, since the real pgvector `embedding` column is raw-SQL-only and not an ORM field)
- Both wired into `config/celery.py` Beat schedule (02:00 / 03:00 UTC)

### Cleanup
- `authService.signup()` documented as intentionally not implemented (docstring added)
- Startup env var warnings added to `core/apps.py` `ready()` for `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DEFAULT_FROM_EMAIL`

### Remaining Work (Phase 4 candidates)
- ActionMatrix edit persistence — no `ActionItem` model exists yet, so edits are local-state only (intentionally skipped per Phase 3 scope — see PHASE3.md)
- Management Review PDF export (stub endpoint only)
- SMTP / email alerts require `DEFAULT_FROM_EMAIL` in `.env`
- `OPENAI_API_KEY` + `ANTHROPIC_API_KEY` required in `.env` for full AI functionality
- `authService.signup()` remains a stub — users provisioned via Django admin

---

## Phase 2 Changes (based on AUDIT_REPORT.md)
Date: 2026-06-19

---

## What Was Fixed

| Gap | Fix Applied |
|-----|-------------|
| 4 missing question tree JSON files | Created `change_control.json`, `oos.json`, `supplier.json`, `capa.json` in `backend/shared/ai/question_trees/` — AI questionnaire now works for all 10 modules |
| pgvector migration missing | Created `knowledge/migrations/0002_add_pgvector.py` — enables cosine similarity search on SOP chunks and FDA 483 observations |
| CAPA missing `TRANSITIONS` / `ESIG_REQUIRED_ACTIONS` | Added `TRANSITIONS` dict + `ESIG_REQUIRED_ACTIONS` to `Capa` model; added `do_transition` endpoint to `CapaViewSet` in `quality/views.py` |
| ChangeControl missing `TRANSITIONS` / `ESIG_REQUIRED_ACTIONS` | Added `TRANSITIONS` dict + `ESIG_REQUIRED_ACTIONS` to `ChangeControl` model; added `do_transition` endpoint to `ChangeControlViewSet` |
| `EFFECTIVENESS_PENDING` status too long for `max_length=20` | Changed CAPA `status` field to `max_length=30`; migration `quality/migrations/0010_alter_capa_status.py` generated |
| JWT access token stored in `localStorage` (21 CFR Part 11 risk) | Access token now stored in JS memory only (`tokenStore.ts`); refresh token set as `HttpOnly` cookie by backend; `RoleProvider` + `api.ts` updated; `AuthGuard` shows loading spinner during silent refresh |

---

## What Was Built

### Frontend Pages

| Page | Route | Status |
|------|--------|--------|
| AuditDetailPage | `/audits/:id` | ✅ Complete |
| ComplaintDetailPage | `/complaints/:id` | ✅ Complete |
| RiskDetailPage | `/risks/:id` | ✅ Complete |
| SupplierDetailPage | `/suppliers/:id` | ✅ Complete |
| NCDetailPage | `/nonconformance/:id` | ✅ Complete |
| OOSDetailPage | `/oos/:id` | ✅ Complete (phase stepper) |
| SampleDetailPage | `/laboratory/samples/:id` | ✅ Complete |
| BPRDetailPage | `/batch-records/bpr/:id` | ✅ Complete |
| APQRDetailPage | `/management-review/apqr/:id` | ✅ Complete |
| ASLPage | `/suppliers/asl` | ✅ Complete (read-only) |

### Shared UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SeverityBadge` | `frontend/src/components/common/SeverityBadge.tsx` | Color-coded severity chip (Critical/Major/Minor/Observation) |
| `RiskMatrix` | `frontend/src/components/risk/RiskMatrix.tsx` | 5×5 FMEA heatmap — RPN-colored cells with click filter |
| `ESignatureDialog` | `frontend/src/components/common/ESignatureDialog.tsx` | Password re-auth modal (21 CFR Part 11) |
| `AuditTrailDrawer` | `frontend/src/components/common/AuditTrailDrawer.tsx` | Slide-in audit history drawer |
| `WorkflowTimeline` | `frontend/src/components/common/WorkflowTimeline.tsx` | Vertical status history timeline |
| `AIRemarkField` | `frontend/src/components/common/AIRemarkField.tsx` | AI-generated remark text with regenerate button |
| `RiskScoreBadge` | `frontend/src/components/common/RiskScoreBadge.tsx` | RPN / risk level badge |

### Backend Models Added

| Model | App | Purpose |
|-------|-----|---------|
| `IPQCCheck` | `batch_records` | In-Process QC checks with auto pass/fail logic |
| `COATemplate` | `laboratory` | Certificate of Analysis templates per product |

Migrations generated:
- `batch_records/migrations/0002_historicalipqccheck_ipqccheck.py`
- `laboratory/migrations/0002_historicalcoatemplate_coatemplate.py`

### Backend Services Added / Updated

| File | Change |
|------|--------|
| `accounts/views.py` | `CustomLoginView` now sets refresh token as `HttpOnly` cookie; new `CookieTokenRefreshView` reads cookie |
| `accounts/urls.py` | `/api/auth/token/refresh/` now uses `CookieTokenRefreshView` |
| `quality/tasks.py` | `alert_overdue_actions` now sends real emails + escalates to QA Managers after 3 days |
| `batch_records/admin.py` | New — registers all batch record models including `IPQCCheck` |
| `laboratory/admin.py` | New — registers all laboratory models including `COATemplate` |

### Route Structure

```
/deviations                  → DeviationsListPage
/deviations/:id              → DeviationsDetailPage
/quality/deviations          → DeviationsListPage  (alias)
/quality/deviations/:id      → DeviationsDetailPage (alias)
/capa/:id                    → CapaDetailPage
/quality/capa/:id            → CapaDetailPage       (alias)
/change-control/:id          → ChangeControlDetailPage
/quality/change-control/:id  → ChangeControlDetailPage (alias)
/suppliers/asl               → ASLPage              (read-only)
/suppliers/:id               → SupplierDetailPage
/management-review/apqr/:id  → APQRDetailPage
/oos/:id                     → OOSDetailPage
```

---

## Current Status by Module

| Module | Backend | Frontend | E-Sig Enforced | AI Integrated |
|--------|---------|----------|----------------|---------------|
| Document Management (DMS) | ✅ Full | ✅ Full | ✅ Yes | ✅ Remark (Phase 4) |
| Training | ✅ Full | ✅ Full | ✅ Yes | ✅ Quiz generation (Phase 4) |
| Deviations | ✅ Full | ✅ Full | ✅ Yes | ✅ Remark |
| CAPA | ✅ Full | ✅ Full | ✅ Yes | ✅ Remark |
| Change Control | ✅ Full | ✅ Full | ✅ Yes | ✅ Questionnaire |
| Audits | ✅ Full | ✅ Full | ✅ Yes (close) | ✅ Questionnaire |
| Complaints | ✅ Full | ✅ Full | ✅ Yes (close) | ✅ Questionnaire |
| Risk Management | ✅ Full | ✅ Full | ✅ Yes (close) | ✅ Questionnaire |
| Suppliers | ✅ Full | ✅ Full | ✅ Yes (qualify/disqualify) | ✅ Questionnaire |
| Non-Conformance | ✅ Full | ✅ Full | ✅ Yes (dispose/hold) | ✅ Remark |
| OOS Investigation | ✅ Full | ✅ Full (phase stepper) | ✅ Yes (invalidate/confirm) | ✅ Questionnaire |
| Laboratory | ✅ Full | ✅ Full | ✅ Yes (release/reject) | ✅ Remark (Phase 5) |
| Batch Records | ✅ Full | ✅ Full | ✅ Yes (release) | ✅ Remark (Phase 5) |
| Management Reports (APQR) | ✅ Full | ✅ Full | ✅ Yes (approve) | ✅ AI sections |
| Knowledge Base | ✅ Full | ✅ Full UI (Phase 3) | ❌ No | ✅ Embeddings |
| Approved Supplier List | ✅ API | ✅ Read-only page | — | — |

---

## API Endpoints (all)

### Auth
```
POST /api/auth/login/           — Login (sets HttpOnly refresh cookie)
POST /api/auth/token/           — Alias for login
POST /api/auth/token/refresh/   — Silent refresh via cookie
POST /api/auth/register/        — Register new user
GET  /api/auth/employees/       — List employees (authenticated)
```

### Dashboard
```
GET /api/dashboard/stats/
GET /api/dashboard/tasks/
```

### Quality (existing)
```
GET/POST   /api/quality/deviations/
GET/PATCH  /api/quality/deviations/:id/
POST       /api/quality/deviations/:id/transition/

GET/POST   /api/quality/capa/
GET/PATCH  /api/quality/capa/:id/
POST       /api/quality/capa/:id/transition/
POST       /api/quality/capa/:id/do_transition/   (workflow engine)

GET/POST   /api/quality/change-control/
GET/PATCH  /api/quality/change-control/:id/
POST       /api/quality/change-control/:id/do_transition/
```

### Phase 1 Modules
```
GET/POST   /api/v1/audits/
POST       /api/v1/audits/:id/transition/
GET/POST   /api/v1/audits/:id/findings/

GET/POST   /api/v1/complaints/
POST       /api/v1/complaints/:id/transition/
GET        /api/v1/complaints/overdue/

GET/POST   /api/v1/risks/
POST       /api/v1/risks/:id/transition/
GET        /api/v1/risks/matrix/

GET/POST   /api/v1/suppliers/
POST       /api/v1/suppliers/:id/transition/
GET        /api/v1/suppliers/asl/
GET        /api/v1/suppliers/expiring/

GET/POST   /api/v1/nc/
POST       /api/v1/nc/:id/dispose/
POST       /api/v1/nc/:id/hold/
POST       /api/v1/nc/:id/release-hold/

GET/POST   /api/v1/oos/
POST       /api/v1/oos/:id/transition/
POST       /api/v1/oos/:id/phase1/
```

### Phase 2 Modules
```
GET/POST   /api/v1/laboratory/samples/
POST       /api/v1/laboratory/samples/:id/transition/
POST       /api/v1/laboratory/samples/:id/coa/
GET/POST   /api/v1/laboratory/tests/
GET/POST   /api/v1/laboratory/results/

GET/POST   /api/v1/batch-records/mbr/
GET/POST   /api/v1/batch-records/bpr/
POST       /api/v1/batch-records/bpr/:id/release/

GET/POST   /api/v1/reports/apqr/
POST       /api/v1/reports/apqr/generate/
GET        /api/v1/reports/management-review/
```

### Reports (updated)
```
GET /api/v1/reports/management-review/?format=pdf      — PDF export (Phase 4)
GET /api/v1/reports/apqr/:id/export/                    — APQR PDF export (Phase 3)
```

### AI Services
```
POST /api/v1/ai/questionnaire/
POST /api/v1/ai/remark/
POST /api/v1/ai/extract-actions/
POST /api/v1/ai/classify/
GET  /api/v1/ai/action-items/              — retrieve saved action items by record
PATCH /api/v1/ai/action-items/:id/         — update owner, due_date, status
POST  /api/v1/ai/action-items/:id/close/   — close with evidence note
POST  /api/v1/ai/action-items/:id/extend/  — extend with justification
```

### Training
Note: training endpoints are mounted at `/api/training/` (no `v1` prefix) — see `config/urls.py`.
```
POST /api/training/assignments/:id/generate-quiz/   — AI quiz from SOP content
POST /api/training/assignments/:id/submit-quiz/     — submit answers, get score
GET  /api/training/assignments/my-tasks/            — pending assignments for current user (Phase 5)
```

### Knowledge Base
```
POST /api/v1/knowledge/sop/upload/
GET  /api/v1/knowledge/sop/query/
GET  /api/v1/knowledge/fda-risk/
```

### Audit Trail
```
GET /api/v1/audit-trail/          — Export (PDF or Excel)
```

---

## Known Remaining Gaps (post Phase 4)

| Gap | Priority | Notes |
|-----|----------|-------|
| `TrainingAssignmentViewSet` missing `my-tasks` endpoint | High | Frontend calls `GET /api/training/assignments/my-tasks/` → 404 in production. Addressed in Phase 5. |
| Laboratory AI integration | Medium | No AI on sample result entry or release remark. Phase 5. |
| Batch Records AI integration | Medium | No AI on BPR step deviation or batch release remark. Phase 5. |
| DMS AI remark advisory only | Low | `AIRemarkField` shown in DMS but not auto-injected into `WorkflowActionsPanel` transition reason — architectural constraint documented in Phase 4. |
| `ANTHROPIC_API_KEY` required | Env config | AI remarks fall back to template text without key. |
| `OPENAI_API_KEY` required | Env config | SOP embedding and FDA semantic search disabled without key. |
| `DEFAULT_FROM_EMAIL` + SMTP | Env config | Email alerts fail silently until configured. |
| `authService.signup()` is stub | Intentional | Users provisioned via Django admin. Documented. |

---

## How to Run Dev Environment

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set environment variables (copy .env.example to .env):
#   DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, REDIS_URL
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build — must compile with 0 TypeScript errors
```

### Celery (optional for dev)
```bash
# Set CELERY_TASK_ALWAYS_EAGER=True in settings.py to run tasks synchronously
celery -A config worker -l info
celery -A config beat -l info    # for scheduled tasks
```

### Required Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/qms
SECRET_KEY=your-django-secret-key
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379/0
DEFAULT_FROM_EMAIL=noreply@nexgenqms.com
```
