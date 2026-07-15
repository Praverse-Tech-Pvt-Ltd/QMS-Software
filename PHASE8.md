# NexGen QMS — Phase 8 Progress Report

Date: 2026-07-15

Phase 8 is production hardening — no new modules. It closes the one real gap Phase 8's build prompt (`CLAUDE_CODE_PHASE8.md`) called out: Phase 7's three new apps (`analyst_qualification`, `inventory`, `integrations`) had tests written but never executed against a real database. The build prompt also corrected two assumptions from Phase 7's own spec that this repo already had right — `training.TrainingItem` doesn't exist, and `dms.Document` is a legacy `TimeStampedModel`, not `BaseModel`. **All blocks are now complete.**

---

## Status at a Glance

| Block | Scope | Status |
|-------|-------|--------|
| 0/1 | Run Phase 7 + full test suite against real Postgres | ✅ Complete — 246 tests pass |
| 2 | Refresh stale "Known Remaining Gaps" table in OVERVIEW.md | ✅ Complete |
| 3 | Password policy (21 CFR Part 11 §11.300) | ✅ Complete |
| 4 | Record retention policy (21 CFR Part 11 §11.10(c)) | ✅ Complete |
| 5 | SCORM 1.2 player | ✅ Complete |
| 6 | Mobile-responsive layout | ✅ Complete |
| 7 | Final health check | ✅ Complete — 10/10 checks pass |

---

## Block 0/1 — Real test run against Neon Postgres+pgvector

No `.env` existed in this repo and Docker Desktop couldn't start in the build sandbox, so this block was blocked until a real `DATABASE_URL` was supplied (Neon, with the `pgvector` extension the `knowledge` app's migrations need). Stored in `backend/.env` — **gitignored, never committed**.

- **Full backend suite: 246 tests, all passing** (`manage.py test --verbosity=2`, ~9 minutes against a live Neon instance).
- **Phase 7 apps** (`analyst_qualification`, `inventory`, `integrations`): 38 tests passing, **91% coverage** — clears the `--fail-under=80` gate with room to spare.
- **`accounts` + `core`**: 26 tests passing.

### The one real bug this surfaced

`InventoryUsageLogSerializer` (`backend/inventory/serializers.py`) declared `lot` as a required, writable field. But `InventoryLotViewSet.usage()` (`backend/inventory/views.py`) supplies `lot` server-side from the URL kwarg — the client never sends it in the request body. Every `POST /api/v1/inventory/lots/:id/usage/` was failing `serializer.is_valid()` on the missing required field *before* the view ever got a chance to inject it, returning 400 instead of 201.

Fix: added `lot` to `read_only_fields` on the serializer, matching the pattern already used elsewhere in the codebase (e.g. `laboratory.TestResultSerializer` doesn't require `test_request` from the client either — the parent object is always supplied by the view). The test assertions were correct and were **not** touched, per the build prompt's explicit "fix the code, not the tests" instruction.

---

## Block 2 — Known Remaining Gaps table

Replaced the stale `## Known Remaining Gaps (post Phase 4)` table in `OVERVIEW.md` with a current one. Then, since this same phase went on to close most of those items, updated it a second time to `(post Phase 8)` — see [OVERVIEW.md](OVERVIEW.md) for the live version. Remaining: retention auto-deletion (policy-as-data only, no purge job), ERP live connection (needs `pyrfc` + SAP SDK from the customer), AI model training (separate workstream), GAMP5 IQ/OQ/PQ (process task, can start now).

---

## Block 3 — Password policy (21 CFR Part 11 §11.300)

**Files:** [`backend/accounts/models.py`](backend/accounts/models.py), [`password_validators.py`](backend/accounts/password_validators.py), [`signals.py`](backend/accounts/signals.py), [`tasks.py`](backend/accounts/tasks.py), [`views.py`](backend/accounts/views.py), [`serializers.py`](backend/accounts/serializers.py)

- `PasswordHistory` model + `password_changed_at`/`must_change_password` fields on `User` (migration `0005_add_password_policy`).
- Three new validators — `MinimumLengthValidator`, `ComplexityValidator` (upper/lower/digit/special), `HistoryValidator` (rejects reuse of the last N passwords). **Important:** `AUTH_PASSWORD_VALIDATORS` already existed in `config/settings.py` before this phase — the new validators were *appended*, not used to replace the list from scratch. Dropped the now-redundant stock `MinimumLengthValidator`/`NumericPasswordValidator`; kept `UserAttributeSimilarityValidator`/`CommonPasswordValidator`.
- `accounts.signals.save_password_history` (registered in `AccountsConfig.ready()`, previously undefined) snapshots every password change, pruned to `PASSWORD_HISTORY_COUNT` (default 5).
- Daily `check_password_expiry` Celery task (default 90 days), registered in `config/celery.py`'s beat schedule.
- `POST /api/auth/change-password/` — verifies current password, runs the full validator chain (including history), sets the new password, clears `must_change_password`, stamps `password_changed_at`.
- Login response (`CustomTokenObtainPairSerializer`) now includes `must_change_password`. Frontend: `RoleProvider` tracks the flag; `AuthGuard` redirects to `/change-password` whenever it's set (additive — the existing unauthenticated-redirect logic wasn't touched). New `ChangePasswordPage` (current/new/confirm fields).
- Tests: 6+ new cases in `accounts/tests.py` covering complexity rejection, history reuse rejection, expiry task flagging, login response shape, and both change-password failure/success paths.

---

## Block 4 — Record retention policy (21 CFR Part 11 §11.10(c))

**Files:** [`backend/core/models.py`](backend/core/models.py), [`retention_views.py`](backend/core/retention_views.py), [`retention_serializers.py`](backend/core/retention_serializers.py), [`retention_urls.py`](backend/core/retention_urls.py), [`management/commands/seed_retention_policies.py`](backend/core/management/commands/seed_retention_policies.py)

- `RetentionPolicy` — a plain `models.Model` (global config table, like `integrations.IntegrationConfig`; not per-site, so not `BaseModel`), `record_type`/`retention_years`/`regulatory_basis`.
- `seed_retention_policies` management command seeds 12 default policies with real CFR citations (Document, CAPA, Deviation, Complaint, AuditLog, Audit, BatchProductionRecord, Supplier, AnalystQualification, InventoryLot, CalibrationRecord, StabilityProtocol) — idempotent (`update_or_create`).
- `GET/POST /api/v1/core/retention-policies/`, `PATCH .../:id/` — any authenticated user can view; only Admin can edit, enforced with a real backend per-method `_is_admin(request)` check (mirroring `accounts.views.SiteViewSet`'s pattern, deliberately *not* copying `integrations.IntegrationConfigViewSet`'s frontend-only enforcement from Phase 7, since this is a compliance-sensitive setting).
- Every edit that actually changes `retention_years` writes an `AuditLog` entry with the old/new values.
- Frontend: `/admin/retention-policies` (Admin-only route + sidebar entry), edit dialog carries the required warning: *"Changing retention periods requires QA approval and change control."*
- **Not implemented:** automated purge/archival against `retention_years` — this phase delivers policy-as-data plus an audit trail, not enforcement.

---

## Block 5 — SCORM 1.2 player

**Files:** [`frontend/public/scorm-api.js`](frontend/public/scorm-api.js), [`frontend/src/pages/training/SCORMPlayerPage.tsx`](frontend/src/pages/training/SCORMPlayerPage.tsx), [`frontend/src/types/global.d.ts`](frontend/src/types/global.d.ts)

- SCORM 1.2 LMS API shim: `LMSInitialize`, `LMSGetValue`, `LMSSetValue`, `LMSCommit` (posts to `/api/training/scorm-results/`), `LMSFinish`, `LMSGetLastError`, `LMSGetErrorString`, `LMSGetDiagnostic` — all return `'true'`/`'false'` strings per the SCORM 1.2 spec, not booleans. `window.initSCORMSession(assignmentId, moduleId)` sets context before the player iframe loads.
- `SCORMPlayerPage` at `/training/scorm/:assignmentId` — fetches the SCORM module (Phase 7's `SCORMModule`/`SCORMResult` models, confirmed unchanged), renders the package in a sandboxed iframe (`allow-scripts allow-same-origin allow-forms allow-popups`) served from `/media/scorm_packages/...`.
- Training list's "Launch E-Learning" button now navigates to the player instead of showing a placeholder toast (was a Phase 7 stub).

---

## Block 6 — Mobile-responsive layout

**Files:** [`frontend/src/components/common/ModuleTable.tsx`](frontend/src/components/common/ModuleTable.tsx), plus the 5 list pages named in the spec

- **Discovery during research:** `AppLayout.tsx` already had the responsive navigation shell — a temporary `Drawer` on mobile (below the `md` breakpoint), a permanent sidebar on desktop, and a working hamburger toggle. No new code was needed there; this was verified, not rebuilt.
- `ModuleTable`'s `ColumnDef` gained an optional `hideOnMobile` flag, handled once inside the shared component. Cleaner than the spec's literal instruction (editing 5 list pages individually with per-cell `sx={{display:{xs:'none',...}}}`), since `AuditsListPage`, `ComplaintsListPage`, `NCListPage`, `RisksListPage`, and `SuppliersListPage` all route through `ModuleTable` exclusively — one change, five pages benefit.
- Forms were already using the MUI v7 `Grid size={{xs:12,...}}` API consistently (confirmed via `AuditDetailPage`/`SupplierDetailPage`) — no fixed-width dialog containers were found needing a fix.
- Primary CTA buttons grow to a 44px minimum touch target on mobile via `useMediaQuery`.

---

## Block 7 — Final health check (10/10 pass)

```
python manage.py check                                    # 0 issues
python manage.py makemigrations --check                   # no changes detected
python manage.py test --verbosity=1                       # 246 tests, OK
coverage run (analyst_qualification, inventory, integrations)
  + coverage report --fail-under=80                        # 91%, gate cleared
RetentionPolicy.objects.count() >= 12                       # 12 policies ok
accounts.tasks.check_password_expiry()                      # runs, {'flagged': 0}
integrations.adapters.factory.get_erp_adapter() stub check  # source == 'stub'
grep "localStorage.*token" frontend/src/                    # zero matches
cd frontend && npx tsc --noEmit                              # clean
cd frontend && npm run build                                 # succeeds
ls manifest.json sw.js scorm-api.js                          # all present
```

---

## Commit

`71ebf60` — `feat: Phase 8 — production hardening (password policy, retention policy, SCORM player, mobile responsive)`, 48 files changed, on branch `claude/files-zip-review-da7290`. `backend/.env` (Neon credentials) confirmed gitignored and never staged.

## Remaining (Phase 9+)

- Retention auto-deletion job (currently policy-as-data + audit trail only)
- ERP live connection — needs `pyrfc` + SAP NWRFC SDK from the customer
- AI model training — separate workstream, infrastructure ready since Phase 6
- GAMP5 IQ/OQ/PQ — QA process task, can start now that Phase 8 code is complete
