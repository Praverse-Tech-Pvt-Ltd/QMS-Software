# NexGen Pharma QMS 💊

**Project:** NexGen Pharma QMS (Quality Management System)

A full-stack Quality Management System designed for pharmaceutical compliance, featuring robust Role-Based Access Control (RBAC), document management, and automated workflow tracking.

---

## 🚀 Project Status

**Current Version:** v0.5.0 (Alpha)
**Focus:** Authentication, RBAC, Dashboard, and Core Module Architecture.

---

## 🏗 Architecture Overview

### Tech Stack

**Frontend:** React 18, TypeScript, Vite, Material UI (MUI v5)

**Backend:** Django 5.0, Django REST Framework (DRF)

**Authentication:** JWT (JSON Web Tokens) via `simplejwt`

**State Management:** React Context API (`RoleProvider`)

**Routing:** React Router DOM v6

---

## ✅ Completed Features

### 1. Authentication & Security

- **JWT Authentication:** Secure login/signup flow with Access and Refresh tokens.
- **Custom User Model:** Extended Django `AbstractUser` to include:
  - `role` (Admin, QA, QC, Production, Warehouse, Viewer)
  - `department`
  - `employee_id`
- **Auto-Login:** Users are automatically logged in upon successful registration.
- **Protected Routes:** `AuthGuard` prevents unauthorized access to internal pages.
- **Token Persistence:** Tokens are securely stored in `localStorage` (`auth_token`, `refresh_token`).

### 2. Role-Based Access Control (RBAC)

- **Granular Permissions:** A centralized `permissionService` checks access rights for every action (create, read, edit, delete, approve).
- **Dynamic UI:** Buttons and menus hide/disable automatically based on the user's role.
- **Role Matrix:**
  - **Admin:** Full access to all modules.
  - **QA:** Approval authority, full access to Deviations/CAPA.
  - **QC/Production/Warehouse:** Specific read/write access relevant to their department.
  - **Viewer:** Strict Read-Only access (Default for new signups).

### 3. Modules & Workflows

- **Dashboard:**
  - Real-time KPI cards (Pending Approvals, Open Deviations, etc.).
  - "My Tasks" list tailored to the logged-in user.
  - Quick Action buttons (New Doc, Log Deviation) that check permissions before navigation.
- **Document Management System (DMS):**
  - List view with status filtering.
  - Workflow states: `Draft` → `Review` → `Approved` → `Effective` → `Obsolete`.
- **Deviations & CAPA:**
  - Basic routing and UI shells for logging incidents and corrective actions.

---

## 📂 Project Structure

### Frontend (`/client`)

```text
src/
├── app/
│   ├── providers/          # Context Providers (RoleProvider, ThemeProvider)
│   └── routes/             # AppRouter, ProtectedRoute
├── components/
│   ├── common/             # Reusable UI (Header, Sidebar, PageContainer)
│   └── layout/             # MainLayout (Sidebar + Navbar wrapper)
├── config/
│   └── permissions.ts      # 🔐 The Central Permission Matrix
├── pages/
│   ├── auth/               # LoginPage.tsx, SignupPage.tsx
│   ├── dashboard/          # DashboardPage.tsx
│   └── dms/                # DmsListPage.tsx, DmsEditor.tsx
├── services/
│   ├── api.ts              # Axios instance with Interceptors
│   ├── auth.service.ts     # Login/Register API calls
│   └── permission.service.ts # Logic for checking permissions
└── types/
    ├── auth.types.ts       # User & Role Type definitions
    └── permissions.types.ts # Module & Action definitions
```

### Backend (`/server`)

```text
core/                       # Project Settings
api/                        # Main App
├── models.py               # Custom User Model (Role Enum)
├── serializers.py          # Custom Registration & Token Serializers
├── views.py                # Auth Views (Register, Login, UserDetails)
└── urls.py                 # API Routes (/auth/login, /auth/register)
```

---

## ⚙️ Setup Instructions

### 1. Backend (Django)

```bash
# Navigate to server folder
cd server

# Create virtual env
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Run Migrations
python manage.py makemigrations
python manage.py migrate

# Start Server
python manage.py runserver
```

### 2. Frontend (React)

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start Dev Server
npm run dev
```

---

## 🔮 Roadmap (Next Steps)

- [ ] **DMS Workflow:** Implement the actual "Submit for Review" backend logic.
- [ ] **Audit Trail:** Log every action (who did what & when) in the backend.
- [ ] **PDF Generation:** Allow exporting reports/documents to PDF.
- [ ] **Profile Page:** Allow users to view/edit their own details.

---

**Developed by:** [Your Name/Team]
**License:** Private / Proprietary
