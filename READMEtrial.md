# Enterprise QMS (Inspection‑Ready Frontend System)

This repository contains a production‑grade Quality Management System (QMS) frontend designed to simulate how an enterprise pharmaceutical QMS behaves during audits, inspections, and daily operations.

The backend is mocked, but the UI, workflows, permissions, and data structures are built exactly like a real production system.

---

## High‑Level Objective

A fully connected, role‑based QMS frontend where users can:

- Create and manage quality records (SOPs, Deviations, CAPAs, Change Controls, Training)
- Move records through controlled, auditable workflows
- Perform simulated e‑signatures
- View complete audit trails
- Link related records (Deviation ↔ CAPA ↔ Change Control ↔ SOP ↔ Training)
- Manage daily work via My Tasks, Notifications, and Global Search

---

## Frontend Architecture

- React + TypeScript + Vite
- MUI (Material UI) + Tailwind CSS
- React Query with mocked services
- React Router with protected routes
- Enterprise, inspection‑ready UX

---

## Security & Permissions (RBAC)

Roles:
- Admin
- QA
- QC
- Production
- Warehouse
- Viewer

Features:
- Route guards
- Action‑level permissions
- Locked record read‑only states
- Access Denied page

---

## Workflow Engine

Draft → Submitted → QA Review → Approved → Effective / Closed

Reusable across DMS, Deviation, CAPA, Change Control.

---

## E‑Signature

- Username & password re‑auth (mock)
- Signature meaning
- Signature history log

---

## Audit Trail

- Field‑level change tracking
- Reason for change
- Exportable logs

---

## Document Management (DMS)

- SOP lifecycle with versioning
- Version history
- Periodic review dashboard
- Controlled copy UI

---

## Training & LMS

- Training matrix
- Employee training profiles
- Effectiveness checks
- Retraining impact analysis

---

## Deviation, CAPA & Change Control

- Pharma‑specific fields
- Multi‑tab workflows
- Evidence and closure checklists

---

## Daily Usage Features

- My Tasks Inbox
- Notifications
- Global Search
- Reports UI placeholders

---

## Engineering Quality

- Standardized components
- Clean folder structure
- Error/loading states
- Ready for backend integration

---

## Disclaimer

This project is for educational and internship demonstration purposes only.

---

## Author

Enterprise QMS UX project.
