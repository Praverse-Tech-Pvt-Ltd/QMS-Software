# NexGen Pharma Solutions Pvt. Ltd. — QMS Software (Frontend MVP)

A pharma-friendly, enterprise-grade QMS frontend MVP built with React + TypeScript + MUI.
This Week-1 sprint focuses on UI + workflows + placeholders using mocked JSON and stub API services (FastAPI integration later).

---

## Week-1 MVP Scope (Completed)

### App Shell
- Responsive layout with Left Sidebar + Top Header
- Role Switcher (Admin / QA / QC / Production / Warehouse)
- Protected routes (login required)
- Role-based route permissions enforced (Guard)

### Auth (Dummy / Local Only)
- Signup page (localStorage user store)
- Login page (validates stored user)
- Logout

Note: Dummy auth only (no backend). Token stored in localStorage as `qms_token`.

### Dashboards
- Home Dashboard with KPI cards
- Quick Actions
- My Tasks widget

### Modules (UI + Workflows + Pages)
Modules included in MVP:
- Document Management (DMS)
- Training / LMS
- Deviation / Incident
- CAPA
- Change Control

Each module includes:
- List page with Search + Filters + Status chips + Table
- Create page (validated forms)
- Detail page with:
  - Overview
  - Attachments (Upload UI only)
  - Activity Log (Mock)
  - Approvals (Mock)
  - Right-side Status Workflow Timeline
  - Back button (returns to module list)

### UI Patterns Implemented
- Status workflow: Draft → In Review → Approved → Effective → Closed
- Reusable StatusChip
- Reusable FiltersBar
- Reusable ModuleTable (with actions menu)
- DetailTabsLayout (tabs + right status timeline)

---

## Tech Stack

- React + TypeScript
- Vite
- Material UI (MUI)
- React Router
- react-hook-form + zod (validation)
- notistack (toast notifications)

---

## Folder Structure

```
src/
├── app/
│   └── providers/
│       └── RoleProvider.tsx
├── components/
│   ├── common/
│   │   ├── FiltersBar.tsx
│   │   ├── FormActions.tsx
│   │   ├── KpiCard.tsx
│   │   ├── ModuleTable.tsx
│   │   └── PageHeader.tsx
│   ├── dashboard/
│   │   ├── MyTasksWidget.tsx
│   │   └── QuickActions.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── HeaderActions.tsx
│   │   ├── RoleSwitcher.tsx
│   │   ├── Sidebar.tsx
│   │   └── sidebarConfig.tsx
│   └── qms/
│       ├── ActivityLog.tsx
│       ├── ApprovalsPanel.tsx
│       ├── AttachmentsUploader.tsx
│       ├── DetailTabsLayout.tsx
│       ├── StatusChip.tsx
│       └── WorkflowTimeline.tsx
├── mock/
│   ├── capa.mock.ts
│   ├── change.mock.ts
│   ├── dashboard.mock.ts
│   ├── deviations.mock.ts
│   ├── dms.mock.ts
│   └── training.mock.ts
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── dms/
│   │   ├── DmsCreatePage.tsx
│   │   ├── DmsDetailPage.tsx
│   │   └── DmsListPage.tsx
│   ├── training/
│   │   ├── TrainingCreatePage.tsx
│   │   ├── TrainingDetailPage.tsx
│   │   └── TrainingListPage.tsx
│   ├── deviations/
│   │   ├── DeviationsCreatePage.tsx
│   │   ├── DeviationsDetailPage.tsx
│   │   └── DeviationsListPage.tsx
│   ├── capa/
│   │   ├── CapaCreatePage.tsx
│   │   ├── CapaDetailPage.tsx
│   │   └── CapaListPage.tsx
│   └── change-control/
│       ├── ChangeControlCreatePage.tsx
│       ├── ChangeControlDetailPage.tsx
│       └── ChangeControlListPage.tsx
├── routes/
│   ├── AppRouter.tsx
│   └── RequirePermission.tsx
├── services/
│   ├── auth.service.ts
│   ├── capa.service.ts
│   ├── change.service.ts
│   ├── dashboard.service.ts
│   ├── deviations.service.ts
│   ├── dms.service.ts
│   └── training.service.ts
├── types/
│   ├── permissions.ts
│   └── qms.ts
├── App.tsx
└── main.tsx
```

---

## Getting Started (Setup)

### 1) Install dependencies
```bash
npm install
```

### 2) Start the dev server
```bash
npm run dev
```

App will run at:
```
http://localhost:5173
```

---

## Demo Authentication Flow (LocalStorage)

### Signup
- Route: `/signup`
- Creates a user locally in localStorage
- Auto-login after signup

### Login
- Route: `/login`
- Validates email/password from stored users
- Stores `qms_token = "demo"`

### Logout
- Clears token and returns to `/login`

---

## Role-based Access (Frontend Simulation)

Role switcher in header lets you simulate permissions:
- Admin
- QA
- QC
- Production
- Warehouse

Permissions are enforced by:
- Sidebar visibility (only allowed modules show)
- Route guard (`RequirePermission`) blocks unauthorized URLs

---

## Routes

### Public
- `/login`
- `/signup`

### Protected
- `/` (Dashboard)

#### Document Management (DMS)
- `/dms`
- `/dms/new`
- `/dms/:id`

#### Training / LMS
- `/training`
- `/training/new`
- `/training/:id`

#### Deviations / Incidents
- `/deviations`
- `/deviations/new`
- `/deviations/:id`

#### CAPA
- `/capa`
- `/capa/new`
- `/capa/:id`

#### Change Control
- `/change-control`
- `/change-control/new`
- `/change-control/:id`

---

## Mock Data and API Layer

Backend is not connected yet.
All data comes from:
- `src/mock/*.mock.ts`

All future backend integration will be plugged into:
- `src/services/*.service.ts`

Example:
```ts
export const dmsService = {
  async list() {
    return dmsMock;
  },
};
```

Later, we will replace with real FastAPI calls.

---

## Components Completed

### Common (Reusable)
- PageHeader
- KpiCard
- FiltersBar
- ModuleTable
- FormActions

### QMS Components
- StatusChip
- WorkflowTimeline
- DetailTabsLayout
- ActivityLog (mock)
- ApprovalsPanel (mock)
- AttachmentsUploader (UI only)

---

## Screenshots / Screen Recording (Add Here)

Add screenshots or short screen recording links here.

Suggested screenshots to capture:
- Login page
- Signup page
- Dashboard (KPIs + Tasks)
- DMS List + Create + Detail
- Training List + Detail
- Deviations List + Detail
- CAPA List + Detail
- Change Control List + Detail
- Role switcher + permission blocking demo

---

## What Remains (Next Sprint / Week-2)

### Backend Integration (FastAPI)
- Replace localStorage auth with JWT backend auth
- Replace mock service calls with real API calls
- Add file upload backend integration

### QMS Enhancements
- Real workflow transitions (Draft → Review → Approved)
- e-Signature modal + audit trail logging
- Approval routing + assignment logic
- Comments with users + timestamps
- Notifications with real events

### Additional Modules (Upcoming)
- Internal Audits
- Supplier Management
- Complaints
- Recall
- Risk Management

### UI Improvements
- Pagination and sorting in tables
- Export to PDF/Excel placeholders
- Global search
- Better empty states and loaders
- Dark mode (optional)

### AI Personal Guide Layer (Future)
- Ask QMS Assistant chatbot in header
- Guidance for workflows (CAPA/Deviation triage)
- Smart recommendations based on role + context

---

## License
Internal / Private Project — NexGen Pharma Solutions Pvt. Ltd.
