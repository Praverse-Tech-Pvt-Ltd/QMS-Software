# iPharma AI QMS — Product & Build Blueprint

**Praverse Tech Pvt. Ltd. × NexGen Pharma Solutions Pvt. Ltd.**
Prepared 2026-11-11 · Authors: Pratham Shrivastav (AI/ML), Ashwani Shrivastav (Pharma Quality — domain authority) · Status: working draft v1.0

> Purpose: one document that tells the team (a) what we are building, (b) which gaps in CaliberLIMS, TrackWise and similar systems we close, (c) how the 483/Warning-Letter corpus and the iPharma AI "brain" plug in, (d) exactly where Ashwani sir's expertise becomes product (BMR, filings, inspection readiness), and (e) what to build, in what order.
>
> Claims about competitors are from general market knowledge and must be re-verified against current vendor material before they go in any sales deck (marked **[verify]**).

---

## 1. What we already have (do not rebuild)

| Asset | Where | State |
|---|---|---|
| NexGen QMS (Django 6 + DRF + React 19/MUI) | this repo | 15+ modules: DMS, Deviation, CAPA, Change Control, Audits, Complaints, Risk (FMEA), Suppliers/ASL, NC, OOS, Laboratory/LIMS-core, Batch Records (MBR/BPR/IPQC), APQR, Training (+quiz, certificates), Logbooks, Calibration, Stability, EM, Recall, Multi-site, SPC. 185 backend tests. |
| Part 11 plumbing | `shared/models.py`, `shared/workflow.py` | E-signature records, soft-delete only, `simple_history` audit trail, HttpOnly refresh cookie, in-memory access token. |
| AI plumbing | `shared/ai/*`, `knowledge/*` | Questionnaire trees (10 modules), remark generator (local-LLM → Claude → stub chain), action extractor, risk scorer, classifier hook, SOP chunk + local embeddings, FDA 483 observation table + openFDA scraper. |
| iPharma AI master plan + PRD/SAD/API/Validation/Data-model docs | `files/*.docx` | Product vision, 9-stage change-control flow, 483 intelligence layer, RAG design. |
| iCretegy AI483 app (FastAPI + React) | `D:\PRAVERSE\ICRETEGY\iCretegy-AI483` | Hybrid search assistant, evidence pack builder, LLM adapter, prompt templates. |
| PACA/483 recurring-issue pipeline | `D:\enhancements to fda 483` | Sentence-transformer + HDBSCAN clustering of multi-year observations, USA/India top-15 recurring issues, six-system GMP checklists, category Excel splits. |
| 483 / Warning Letter corpus | Postgres (versioned copy), per the data notes | Keys: firm, FEI, inspection date, doc type, CFR section. See §7 for known gaps. |

**Principle:** the QMS is the *system of record*; iPharma AI is the *intelligence layer*; NexGen's methodology is the *content and the guardrails*. The next phase is mostly **joining these three**, not inventing new modules.

---

## 2. Positioning — the gaps we close

### 2.1 What the incumbents are, and where they stop

| Capability | CaliberLIMS | TrackWise / TrackWise Digital | Veeva Vault QMS / MasterControl | **iPharma AI QMS (target)** |
|---|---|---|---|---|
| Core | LIMS: sample, test, spec, COA, instruments, stability **[verify]** | Enterprise QMS: CAPA, deviation, change, complaints, audits **[verify]** | Doc control + QMS + training, strong regulated-cloud posture **[verify]** | Unified QMS + LIMS-core + eBMR + KB in one data model |
| Where QMS and LIMS meet | Separate products / integration projects | Needs LIMS integration | Needs LIMS integration | OOS ↔ deviation ↔ CAPA ↔ batch release already share one DB |
| Guided forms | Static forms | Configurable but static; heavy admin to configure | Configurable | **Adaptive AI questionnaire** per event type with branching and GMP rationale |
| Regulatory intelligence | None | None native | Limited | **483/Warning-Letter precedent shown inside the workflow** |
| SOP awareness | Doc attached | Doc attached | Doc-centric | **SOP-RAG with section-level citations**; flags open records when an SOP revises |
| Remark writing | Free text | Free text | Free text | **Role-aware draft remarks** (HOD / QA / QA Head), human edits + e-signs |
| Inspection readiness | Reports | Reports | Dashboards | **Continuous "all-time readiness" score**, mock-inspection mode, response-letter drafting |
| Time to value / cost | Heavy implementation | Heavy implementation, long validation | Heavy | Light config, India-first pricing, validation pack shipped |
| Filing/dossier link | None | None | Separate RIM product | **Change → regulatory-trigger → filing tracker (DMF/CEP/eCTD)** |

### 2.2 The seven gaps (our product thesis)

1. **QMS and LIMS live in different worlds.** We keep them in one schema so an OOS result *is* a QMS event with no integration layer.
2. **Forms are blank pages.** Users fear writing the wrong thing. We ask the right questions and draft the GMP-language answer.
3. **Nobody shows the inspector's view.** We attach real 483/WL precedent (CFR section, frequency, firms) at decision points.
4. **SOPs are filed, not used.** We make SOPs answer questions, validate actions and generate training.
5. **Document authoring is manual.** BMR/MBR, SOPs, protocols, investigation reports and responses are written from scratch. We generate controlled first drafts from templates + the company's own SOPs. (§5)
6. **Filings are disconnected from change.** A change that triggers CBE-30/PAS/Type IB is caught at initiation, not at the next dossier update.
7. **Readiness is an event, not a state.** Ashwani sir's principle — be ready any day — becomes a live score and a one-click "inspector's pack".

### 2.3 What we deliberately will *not* claim
- No "AI approves" anything. AI drafts, flags, retrieves, summarises. Humans decide and e-sign. (This is also our Part 11 / Annex 11 / GAMP 5 AI-governance stance.)
- No unverified "FDA-trained" claims: every figure must trace to a source document (see §7).
- No inspection-success claims on the product; those belong to NexGen services.

---

## 3. The iPharma AI "brain" — architecture to take forward

```
 ┌────────────────────── Inputs ──────────────────────┐
 │ 483s · Warning Letters · EIRs · openFDA · PACA      │
 │ Company SOPs · BMR/BPR · Protocols · Deviations/CAPA│
 │ NexGen playbooks (audit checklists, response format)│
 └───────────────┬────────────────────────────────────┘
                 ▼
   Ingestion (parse/OCR → normalise → chunk → embed)  ── provenance on every row
                 ▼
   ┌──────────── Stores ─────────────┐
   │ Postgres (facts, versioned)     │  firm/FEI/date/doctype/CFR → structured
   │ pgvector (semantic)             │  SOP chunks, 483 text, WL text
   │ Rules library (YAML/JSON)       │  regulatory triggers, impact scoring, checklists
   └───────────────┬─────────────────┘
                   ▼
   Services (stateless, citation-first)
     • Precedent search      "what did FDA cite for X, how often, to whom"
     • SOP-RAG               grounded answers + section cites
     • Questionnaire engine  adaptive question trees
     • Drafting engine       remark / BMR / SOP / response / report drafts
     • Scoring               impact, readiness, 483-exposure
                   ▼
   Guardrails: citation required · "not found" is a valid answer · no figure without source ·
               every AI output stored with model, prompt version, sources, reviewer decision
                   ▼
   QMS modules (Change, Deviation, CAPA, OOS, Batch, Audit, Training, APQR …)
```

### 3.1 Design rules inherited from the 483 data notes
- **Primary keys:** firm + FEI + inspection date + document type + CFR section.
- **Provenance:** answers state the basis ("n = 412 letters 2013-2024, excluding years not held").
- **Missing data is "not held", never zero.** Warning-Letter years 2010, 2012, 2017-2019 absent; ~734 downloads failed; ~6% letters state-placeable; ~106 poor-scan 483s OCR'd with caveats; Dr. Reddy's letters absent; year range inconsistent (1998-2026 header vs 2009-2026 corpus, a stray 2029). These are **P0 data-quality tasks** before any statistic is shown to a customer (§7).
- **Versioned releases with rollback** — the knowledge base is a validated component; a bad ingest must be reversible.

### 3.2 Model strategy (keep what is already wired)
1. **Retrieval first.** Most value is search + citation, not generation. Local `all-MiniLM-L6-v2` embeddings now; evaluate a larger multilingual/biomedical embedder later with a held-out query set.
2. **Generation chain:** `LOCAL_LLM_URL` → Claude → deterministic template stub (already implemented in `remark_generator.py`). Keep it; add per-module prompt versions.
3. **Classifier:** fine-tune (CFR-section / system classifier — six-system model: Quality, Production, Lab, Materials, Facilities & Equipment, Packaging & Labeling) once labelled data is cleaned. Hook exists at `ml/models/classifier/`.
4. **Evaluation harness (new, §8 Sprint 1):** 100-200 curated questions written by Ashwani sir with expected citations; track retrieval hit-rate and "unsupported claim" rate every release. No harness → no claims.

---

## 4. Module roadmap — closing CaliberLIMS & TrackWise gaps

Status key: ✅ built · 🟡 built, needs depth · 🔴 not started.

### 4.1 LIMS side (CaliberLIMS parity)
| Capability | Status | Next step |
|---|---|---|
| Sample login, test assignment, result entry, spec check, COA | 🟡 | Fix frontend/backend field mismatches noted in OVERVIEW Phase 6 "Remaining"; add specification master with versions. |
| OOS Phase I/II, OOT | ✅ | Add OOT limits per product/test from stability + SPC. |
| Instrument calibration | ✅ | Add instrument *qualification* (IQ/OQ/PQ) and usage logs tied to analyst. |
| **Analyst qualification** | 🔴 | Method-wise analyst qualification matrix; block result entry if analyst not qualified (Training ↔ LIMS link). |
| **Inventory: reagents, columns, reference standards, volumetric solutions** | 🔴 | Receipt → expiry → usage → disposal; expiry blocks use in result entry. |
| Stability | 🟡 | Chamber mapping, pull-schedule calendar, trend/OOT with regression shelf-life estimate. |
| Method validation / transfer records | 🔴 | Parameter-level records with acceptance criteria; link to specs. |
| Instrument data import (HPLC/GC/Balance) | 🔴 | File-parser adapters (CSV/PDF export) first; CDS integration later. |
| Chromatography audit-trail review | 🔴 | Structured *audit-trail-review* record (weekly/per-batch) — a top 483 theme and a NexGen CSV service line. |

### 4.2 QMS side (TrackWise parity)
| Capability | Status | Next step |
|---|---|---|
| Deviation, CAPA (+effectiveness), Change Control, Complaints, Audits, NC, Risk, Supplier, Recall | ✅/🟡 | Cross-module **Record Linking graph** (deviation → CAPA → change → training → document) with one-click traversal. |
| Workflow configurability | 🟡 | Admin UI for TRANSITIONS / SLA / approver routing per site (currently code-defined). |
| Management review & APQR | 🟡 | AI-drafted APQR sections from real data; trend charts per product. |
| Regulatory-trigger engine | 🔴 | Rules library for CBE-0/30, PAS, Type IA/IB/II, DMF amendment, CEP revision. (§5.4) |
| Inspection management | 🔴 | Inspection event, request tracker (document requests with owner + SLA), back-room/front-room log, observation → response → CAPA. (§5.5) |
| Notifications | 🟡 | Email + in-app digest; WhatsApp/Teams optional. |
| ERP hooks | 🔴 | Material master, batch, vendor sync (SAP/Oracle) via a thin connector layer. |
| Mobile PWA | 🔴 | Operator logbook, approvals on tablet. |

### 4.3 What nobody else bundles (our edge)
- **Precedent cards** (483/WL) on every high-risk decision.
- **SOP-grounded drafting** with citations.
- **Document Studio** (§5): BMR, SOP, protocol, report and response generation, with NexGen-authored templates and reviewer checklists.
- **Readiness score + inspector's pack** (§5.5).
- **Filing tracker** (§5.4).

---

## 5. NexGen × Praverse: where Ashwani sir's expertise becomes product

NexGen's published services (GMP audits & mock inspections, quality consulting incl. 483/WL responses and data-integrity remediation, CSV/CSA, regulatory affairs incl. DMF/CEP/eCTD, training) map one-to-one onto product features. The product makes the expertise **repeatable and available between visits**; the services stay the high-trust layer on top.

> Boundary to confirm with Ashwani sir: the NexGen site does not currently list BMR/BPR authoring or SOP authoring as services. We are proposing them as **new product capabilities** he would define the content for. Please confirm scope and wording before any external statement.

### 5.1 Expert-in-the-loop model (applies to everything below)
```
AI draft  →  QA author edits  →  NexGen expert review (optional, paid)  →  Company approval + e-sign
              ▲ templates, checklists, red-flag rules authored once by Ashwani sir
```
Every generated document carries: template ID + version, source SOP/regulation citations, model/prompt version, reviewer chain. "NexGen-reviewed" is a status a document earns, never a default.

### 5.2 Document Studio — what we generate
| Document | Inputs | AI does | Expert content needed from Ashwani sir |
|---|---|---|---|
| **MBR / BMR (master batch record)** | Product, dosage form (OSD / sterile / API), batch size, process stages, equipment train, specs, yield formula | Builds stage-by-stage skeleton: dispensing, granulation, blending, compression, coating, packing / API: reaction, work-up, isolation, drying, milling, blending; inserts line-clearance, critical-step e-sign, IPQC, yield-reconciliation, deviation hooks | Master stage library per dosage form; list of mandatory GMP fields per stage; critical-vs-non-critical rules; typical IPQC and yield limits as *templates* (never auto-applied without product data) |
| **BPR issuance & review** | Approved MBR | Pre-issue checklist; during-execution anomaly flags; **review-by-exception** summary | Batch-record review checklist (what QA must verify, common miss patterns) |
| **SOPs** | Purpose, scope, existing SOP library | Draft to company template with responsibilities, procedure, references, revision table; gap-check against 483 patterns for that topic | SOP skeletons for ~40 core GMP topics; mandatory clauses per topic |
| **Validation protocols / reports (IQ/OQ/PQ, PV, cleaning, CSV)** | Equipment/system, risk class | Protocol skeleton, test-script table, acceptance criteria placeholders, traceability matrix | GAMP 5 / Annex 15 / FDA PV 2011 templates; CSA risk rules |
| **Deviation / OOS / CAPA investigation reports** | Record data | Structured report, 5-why/fishbone prompts, root-cause suggestions from similar history, CAPA effectiveness criteria | Root-cause taxonomy; inadequate-investigation red flags |
| **Change-control package** | Questionnaire answers | Impact score, regulatory trigger flag, justification draft, implementation checklist | Regulatory-trigger rules (§5.4); impact matrix tuning |
| **483 / Warning-Letter response** | The observation text, site records | Observation-by-observation response skeleton: acknowledgement, investigation summary, root cause, correction, corrective/preventive action, effectiveness check, due dates; pulls similar historic *public* responses/CFR cites | NexGen response structure and tone guide; "do-not-say" list (admissions, vague commitments); commitment-tracker rules |
| **APQR / PQR** | Batch, deviation, OOS, complaint, change, stability data | Draft narrative + trends | Section structure per market (FDA 211.180(e), EU GMP Ch.1) |
| **Audit plan / checklist / report** | Audit type, scope, area | Checklist from six-system model + 483 recurring issues; classified observation report (critical/major/minor) | Audit checklists per area; classification rules; 7-business-day report format |

### 5.3 BMR deep-dive (first thing we start building — see §8)
Layered generation, deterministic where it matters:
1. **Template layer (code, expert-authored):** dosage-form → ordered stages → mandatory fields per stage. Deterministic, testable, versioned.
2. **Product layer (user data):** formula, equipment, parameters, specs, limits. Entered/uploaded; never invented by AI.
3. **AI layer:** wording of instructions, cross-checks (e.g., "compression step has no hardness/friability IPQC"), omissions vs 483 pattern ("batch record missing step for line clearance").
4. **Gate:** MBR can only be approved when all mandatory fields are filled and the validation checklist (§6) has zero blocking items. Approval = e-signed workflow already in `batch_records`.

### 5.4 Filing & regulatory-trigger tracker (DMF / CEP / eCTD)
- **Registered-state register:** per product × market: DMF number/type, CEP, ANDA/NDA/MA references, registered site, equipment/process/specs as filed.
- **Trigger rules library** (authored with Ashwani sir; stored as data, versioned): e.g. site change, equipment change with different operating principle, specification tightening/loosening, supplier of KSM change, batch-size change → *category* (FDA: CBE-0/CBE-30/PAS/annual report; EU: Type IA/IAIN/IB/II; DMF: amendment; CEP: revision/renewal). **Output is "possible trigger — Regulatory Affairs to confirm", never a decision.**
- **eCTD helper:** module 1-5 folder skeleton generator, document inventory with status (draft / reviewed / approved / published), lifecycle sequence tracking, and deficiency-response tracker with deadlines.
- Pulls from change control Q4 (existing questionnaire already asks about filings).

### 5.5 Inspection readiness & mock-inspection mode ("all-time readiness")
- **Readiness score (daily):** open records × age × severity × historical 483 citation frequency for that area; broken out by the six systems.
- **Mock inspection workspace:** planned scope → checklist (six-system model + recurring 483 themes) → finding capture with classification → classified observation report → remediation roadmap → CAPA creation. Matches NexGen's mock-inspection deliverable.
- **Inspection day mode:** document-request log (who asked, what, owner, SLA, delivered Y/N), front/back-room notes, daily debrief export.
- **483 response tracker:** observation → response draft → commitments with owners and dates → effectiveness check. Commitments become action items automatically.
- **Inspector's pack:** one-click export (org chart, SOP index, open deviation/CAPA/change list, training status, calibration, last audit trail reviews) — scoped, watermarked, logged.

### 5.6 CSV/CSA and Data-integrity support
- Our own system ships with a **validation pack** (URS, FS, risk assessment, IQ/OQ/PQ scripts, traceability matrix, VSR) — the docs in `files/05_Compliance_Validation_Plan.docx` seed this.
- **ALCOA+ self-check** module: periodic audit-trail review records, user-access review, shared-login detection, backup/restore test log.
- Optional NexGen service: validate the customer's *other* systems using the same templates.

---

## 6. AI governance, compliance & validation (non-negotiable)

| Area | Rule |
|---|---|
| Intended use | Decision-support only; documented in URS. No autonomous approvals. |
| GAMP 5 / CSA | Treat as Category 4/5 mixed; risk-based assurance; AI features individually risk-rated (low: search; medium: drafting; high: any scoring that influences release/approval — keep advisory). |
| Part 11 / Annex 11 | E-sign + audit trail on every human decision; AI output stored as a *record* (prompt version, model, retrieved sources, output, reviewer action). |
| Data integrity | ALCOA+: AI-edited text is attributable (diff between draft and signed text kept). |
| Hallucination control | Citation required; "no source found" is shown, not smoothed over; numeric claims only from the DB with provenance. |
| Confidentiality | Option for fully local LLM + embeddings (already supported via `LOCAL_LLM_URL`); tenant-level data isolation; no customer data to training. |
| Model change control | Model/prompt/ruleset changes go through our own Change Control; regression run of the evaluation set before release. |
| Security | OWASP ASVS pass, pen test pre-launch, secrets out of repo (note: `backend/Tokens.txt` and `.env` files must never be committed — **rotate any key that has been in git history**). |

---

## 7. Data plan — 483 / Warning Letter corpus

### 7.1 P0 data-quality fixes before any customer-visible statistic
1. Reconcile year coverage: app header 1998-2026 vs corpus 2009-2026; remove/explain the 2029 value; store `coverage_by_year` table and show "not held" explicitly.
2. Re-run the ~734 failed Warning-Letter downloads; log permanent failures with reason.
3. Fill or declare gaps: WL years 2010, 2012, 2017-2019; Dr. Reddy's letters absent (only 2011 "Dr. Reddys de Mexico") — alias table for firm-name variants.
4. OCR quality: tag the ~106 poor-scan 483s with `ocr_confidence`; exclude from counting until reviewed or show as lower-confidence.
5. State placement (~6%): improve with FEI → establishment address join; until then never present state-level rankings.
6. Normalise CFR sections (211.22, 211.100, 211.192, 211.68, 211.160 …) and map to the six-system model.

### 7.2 Target schema (additions to `knowledge`)
`Inspection(fei, firm_id, start/end date, type)` → `Observation(inspection, number, cfr_section, system, text, severity, source_doc_id, ocr_confidence)` → `SourceDocument(type, url, sha256, retrieved_at, release_version)`; `CoverageByYear`; `FirmAlias`. Every API answer returns `basis: {n, years_held, years_not_held, release_version}`.

### 7.3 Where precedent surfaces (already specified in the master plan §5.2)
Questionnaire answer → inline card · impact score → collapsible risk card · QA assessment checklist items → citation-count badge · remark drafting → regulatory language suggestions · rejection letters → CFR-mapped · executive dashboard → 483 exposure index.

---

## 8. Build plan — sequenced

Each sprint ends with tests green and a demo-able increment. Domain checkpoints with Ashwani sir are marked 🧑‍🏫.

### Sprint 0 — this week (started)
- [x] Pull latest repo, survey, write this blueprint.
- [x] **`docstudio` backend app:** dosage-form stage library, MBR skeleton generator, validation checklist (deterministic, tested). *(see code)*
- [x] **Regulatory-trigger rules engine** (data-driven) with starter ruleset marked *draft — pending expert review*. *(see code)*
- [ ] 🧑‍🏫 Ashwani sir reviews: stage library, mandatory-field list, trigger rules, 483 response structure.

### Sprint 1 (week 1-2) — Foundation of the brain
- Evaluation harness + 100 curated Q&A with expected citations.
- Coverage/provenance tables; P0 data fixes (§7.1).
- Precedent search API: `GET /knowledge/precedent/?cfr=211.68&system=…` returning count, years held, example firms, basis.
- Fix known frontend/backend mismatches (Laboratory, Management Review KPI shape, `reportsService` prefix).

### Sprint 2 (week 3-4) — Document Studio v1
- Frontend: "New MBR from template" wizard → review → approve (reusing batch_records approval).
- LLM wording layer for instructions (chain already wired), with diff-vs-draft stored.
- SOP drafting from template + RAG; training auto-assignment on approval.
- Response-letter drafter for 483 observations (skeleton + commitments to action items).

### Sprint 3 (week 5-6) — Filing & inspection
- Registered-state register + trigger engine wired into Change Control Q4.
- Inspection event module + document-request tracker + readiness score.
- eCTD folder/inventory helper.

### Sprint 4 (week 7-8) — LIMS depth
- Analyst qualification, reagent/reference-standard inventory, specification master, audit-trail-review record.
- OOT limits from SPC; stability regression.

### Sprint 5+ — Hardening & go-to-market
- Validation pack generation, pen test, backup/DR, PWA, ERP connector, pilot site.
- Pilot with one NexGen client plant (API or OSD) under NDA; measure drafting time saved and findings caught.

---

## 9. Open questions for Ashwani sir / the team

1. Which dosage forms first — OSD, API, sterile? (Recommend OSD + API: matches his plant background and the largest India customer base.)
2. Confirm that NexGen will offer expert review of generated documents as a paid service, and the review SLA.
3. Preferred BMR/BPR formats per client type (Indian domestic, USFDA-registered, EU) — can he share 2-3 anonymised exemplars?
4. His response-letter template and "never write this" list for 483 responses.
5. Which regulatory-trigger rules must be correct on day 1 (US, EU, WHO-PQ, others)?
6. Data location: can pilot customers accept cloud, or do we need on-prem with a local LLM from day 1?
7. Do we reuse the iCretegy-AI483 FastAPI service as a microservice, or fold its search/evidence-pack code into Django `knowledge`? (Recommendation: **fold in**, one stack to validate.)
8. Confidentiality: the Amneal SOW/proposal materials on this machine are client-confidential and were deliberately **not** used in this work.

---

## 10. Appendix — NexGen capability → product map

| NexGen service (per their site) | Product feature |
|---|---|
| GMP audits, mock inspections, pre-approval readiness | Audit module + mock-inspection workspace + readiness score |
| Supplier/vendor audits | Supplier qualification + audit checklist generator |
| QMS design, CAPA/deviation management | Workflow configurator, root-cause library, CAPA effectiveness |
| ALCOA+ / data-integrity remediation | DI self-check, audit-trail-review records |
| Form 483 & Warning Letter responses | Response drafter + commitment tracker + precedent search |
| CSV/CSA (LIMS, ERP, MES, CDS, AI/SaaS) | Validation pack, system inventory, periodic review |
| DMF, CEP, eCTD, deficiency responses | Filing register, trigger engine, eCTD inventory, query tracker |
| GMP training | Training module, quiz-from-SOP, certificates, retraining on revision |
