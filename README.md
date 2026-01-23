# NexGen QMS Frontend (Sprint Build)

Frontend UI for NexGen Pharma Solutions Pvt. Ltd. Quality Management System (QMS).
This build focuses on production-like workflows using mock data, with a clean enterprise UI and future-ready API/service stubs (FastAPI integration later).

---

## Tech Stack

- React + TypeScript (Vite)
- Material UI (MUI)
- React Router
- React Hook Form + Zod validation
- notistack (toasts)
- LocalStorage mock persistence (workflow/audit/signatures)

---

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Start dev server
```bash
npm run dev
```

App runs on:
- http://localhost:5173

---

## Authentication (Mock)

This project currently uses dummy authentication (UI-only).

- Login route: /login
- Signup route: /signup

A mock token is stored in localStorage:
- qms_token

Logout clears the token and redirects to /login.

---

## Roles & Permissions (Simulation)

Role switching exists to simulate access control:

- Admin
- QA
- QC
- Production
- Warehouse

Permissions are enforced on routes using:
- RequirePermission

Example: Training Matrix is visible only for Admin / QA / QC.

---

## Modules Included (Week-1 + Sprint Enhancements)

### Document Management (DMS)
- List page with filters/search/status chips/table
- Create page with validations + back button
- Detail page with tabs (Overview / Attachments / Activity / Approvals)
- SOP version history UI (v1.0/v1.1)
- Periodic review scheduling UI

Routes:
- /dms
- /dms/new
- /dms/:id

---

### Training / LMS
- List page + Create + Detail screens
- Training Matrix (Role → SOP mapping)
- Employee Training Profile (assigned trainings, completion %, overdue)

Routes:
- /training
- /training/new
- /training/:id
- /training/matrix
- /training/employees/:id

---

### Deviation / Incident
- List page + Create + Detail screens
- Upgraded create form with pharma fields + tabs:
  - Containment
  - Investigation
  - CAPA Linkage

Routes:
- /deviations
- /deviations/new
- /deviations/:id

---

### CAPA
- List page + Create + Detail screens
- Effectiveness Check UI + Closure Checklist

Routes:
- /capa
- /capa/new
- /capa/:id

---

### Change Control
- List page + Create + Detail screens
- Impact Assessment UI:
  - Validation / Regulatory / Stability / Docs / Training / Supplier
- Risk assessment notes + mitigation
- Implementation Plan (cards)

Routes:
- /change-control
- /change-control/new
- /change-control/:id

---

## Common QMS Workflow Features

### Workflow Lifecycle (UI + Mock persistence)
Lifecycle implemented across modules:
- Draft → QA Review → Approved → Effective → Closed
- Reject supported

Stored per record in LocalStorage via:
- workflow.service.ts

---

### Workflow Actions (Role Based)
Actions are enabled based on role + status stage:
- Submit for QA Review
- Approve / Reject (with reason)
- Mark Effective
- Close

Component:
- WorkflowActionsPanel

---

### E-Signature (UI only)
Workflow transitions trigger an E-Sign Modal:
- Re-auth username/password (placeholder)
- Signature meaning: Review / Approval / Execution
- Signature comment

Signatures are logged per record:
- SignatureLogTable

---

### Audit Trail (Read-only UI)
Audit Trail table included below Activity Log:
- action type
- field
- old/new values
- user
- timestamp
- reason

Filters:
- User
- Action Type
- Date range

---

## Folder Structure (Recommended)

```
src/
  app/
    providers/
  components/
    common/
    layout/
    qms/
    dms/
    capa/
    change/
  pages/
    auth/
    dashboard/
    dms/
    training/
    deviations/
    capa/
    change-control/
  routes/
  services/
  types/
```

---

## Notes

- This sprint is frontend-only (no backend integration yet).
- The UI is designed to be enterprise/premium and pharma-friendly.
- Later integration targets:
  - FastAPI backend
  - Real RBAC
  - Database-backed workflows
  - Immutable audit logs
  - 21 CFR Part 11 compliant e-sign controls

---

## Demo Flows (Recommended to Record)

### DMS
Create → Submit QA Review → Approve → Mark Effective → Close

### Deviation
Create → Submit QA Review → Approve → Mark Effective → Close

---

## What Remains (Next Sprint Ideas)

- Controlled document distribution + read acknowledgements
- Full approver assignment UI (people picker)
- SOP linking inside Training Matrix from real DMS records
- Editable implementation plan table (inline row editing)
- Module-level dashboards and analytics
- Audit trail generation for field edits (not just status changes)
- Better mock API layer (async + simulated latency)
- Export / Print views (PDF placeholder)
