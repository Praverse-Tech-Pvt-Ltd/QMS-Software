
# Enterprise QMS Frontend (Inspection‑Ready UX)

This repository contains a **production‑grade Quality Management System (QMS) frontend** designed to demonstrate how an enterprise pharmaceutical QMS behaves during audits, inspections, and day‑to‑day operations.  
The backend is **mocked**, but the UI, workflows, permissions, and data structures are built exactly like a real system.

---

## 🎯 High‑Level Objective

A fully connected, **role‑based QMS frontend** where users can:

- Create and manage quality records
- Move records through controlled workflows
- Perform e‑signatures
- View complete audit trails
- Link records (Deviation ↔ CAPA ↔ Change Control ↔ SOP ↔ Training)
- Manage daily work through tasks and notifications

---

## 🧱 Architecture Overview

- **Frontend**: React + TypeScript + MUI
- **State & Data**: Mock services shaped like real APIs
- **Auth**: Mock role‑based auth (RBAC)
- **Workflow Engine**: Centralized and reusable across modules
- **Design**: Inspection‑ready, enterprise UX

---

## A) Security & Permissions (RBAC)

### Roles
- Admin
- QA
- QC
- Production
- Warehouse
- Viewer

### Implemented
- Permissions matrix per module & action
- Route guards for unauthorized access
- Action‑level permissions (Create / Edit / Submit / Approve / Close / Reopen)
- Read‑only locked records with reason display
- Dedicated **Access Denied** page
- Consistent permission error handling

---

## B) Workflow Engine (Shared)

### Supported Modules
- DMS
- Deviations
- CAPA
- Change Control

### Workflow Capabilities
- Config‑driven workflow definitions
- Status timelines
- Validated transitions
- Reject / Return to Draft with comments
- Mandatory field & attachment checks
- Multi‑approver (parallel & sequential)
- Due dates & escalation indicators

---

## C) E‑Signature (UI‑Only)

- Re‑authentication placeholder (username/password)
- Signature meaning:
  - Review
  - Approval
  - Execution
  - Verification
- Confirmation statement
- Signature stamp on record header
- Dedicated **Signature History** tab

---

## D) Audit Trail

- Action‑level audit logging
- Old vs new value tracking
- Reason‑for‑change enforcement
- Filters: date, user, action, field
- Export (JSON / CSV – mocked)

---

## E) Document Management System (DMS)

- SOP lifecycle:
  - Draft → Review → Approved → Effective → Superseded / Archived
- Versioning:
  - v1.0 / v1.1 / v2.0
- Version history & comparison UI
- Controlled copy badge
- Print / download controls
- Periodic review dashboard

---

## F) Training / LMS

- Training Matrix (Role → SOP mapping)
- Department‑based views
- Employee training profiles
- Completion % and overdue tracking
- Training history timeline
- Effectiveness checks (quiz + OJT placeholders)
- SOP version change impact → retraining assignment

---

## G) Deviation, CAPA & Change Control

### Deviations
- Pharma‑specific fields (batch, material, equipment, severity)
- Tabs:
  - Containment
  - Investigation
  - Risk Assessment
  - CAPA Linkage
  - Approvals
  - Audit Trail

### CAPA
- Action plan table
- Owners, due dates, evidence
- Effectiveness checks
- Closure checklist

### Change Control
- Impact assessment (validation, regulatory, training, etc.)
- Implementation plan
- Verification & closure

---

## H) Daily Usage Features

- My Tasks Inbox
- Notifications Center
- Global Search (cross‑module)
- Reports UI (Pareto & trends – placeholders)

---

## I) Engineering Quality

- Standardized components:
  - Tables
  - Forms
  - Tabs
  - Status chips
  - Workflow timelines
  - Modals
  - Attachment uploaders
  - Comment threads
- Clean folder & route structure
- Error / loading / empty states everywhere
- Mock service layer shaped like real APIs
- Storybook‑ready component design

---

## 📦 Deliverables Included

- ✅ Enterprise‑grade frontend UI
- ✅ Updated README (this file)
- ✅ Mock JSON data (users, SOPs, tasks, deviations, CAPA, CC)
- ✅ Inspection‑ready UX patterns
- ✅ Demo‑ready workflows

---

## 🚀 Demo Scenarios Supported

- SOP creation → review → approval → effective → supersede
- Deviation creation → QA review → approval → CAPA linkage → closure
- E‑signature & audit trail visibility
- Task inbox & notification flow
- Global search across modules

---

## ⚠️ Disclaimer

This project is a **UI‑only demonstration**.  
Authentication, digital signatures, and compliance logic must be implemented server‑side for regulated production use.

---

## 👨‍💻 Author

Built as an **enterprise‑grade QMS UX showcase** for audits, demos, interviews, and SaaS validation.

