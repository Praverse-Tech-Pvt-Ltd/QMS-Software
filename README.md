# NexGen Pharma QMS 💊

**NexGen Pharma QMS** is a robust, enterprise-grade Quality Management System specifically designed for the pharmaceutical industry. It ensures compliance, automates controlled workflows, and maintains strict quality standards throughout the product lifecycle. This system is designed to be inspection-ready, simulating how a real pharmaceutical QMS behaves during audits and daily operations.

---

## 🚀 Project Status

**Current Version:** v0.5.0 (Alpha)
**Current Focus:** Authentication, RBAC, Dashboard, and Core Module Architecture.

---

## 🏗 High-Level Architecture

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Material UI (MUI v7), Tailwind CSS
- **Backend:** Django 6.0, Django REST Framework (DRF)
- **Database:** PostgreSQL (via Neon DB)
- **Authentication:** JWT (JSON Web Tokens) with custom Role-Based Access Control (RBAC)
- **State Management:** React Context API (`RoleProvider`)
- **Routing:** React Router v7

---

## 🛡 Security & Role-Based Access Control (RBAC)

The system uses a **Matrix-Based Permission Model** to decide "Who can do what."

### Roles
- **Admin:** Full access to all modules and system settings.
- **QA (Quality Assurance):** Approval authority, control over Deviations, CAPA, and DMS lifecycles.
- **QC (Quality Control), Production, Warehouse:** Specific read/write access relevant to their departments.
- **Viewer:** Strict Read-Only access (default for new signups).

### Key Security Features
- **JWT Authentication:** Secure login/signup flow with Access and Refresh tokens.
- **Granular Permissions:** A centralized `permissionService` checks access rights for every action (create, read, edit, delete, approve).
- **Dynamic UI:** UI elements (buttons, menus) are conditionally rendered or disabled based on user permissions.
- **Route Protection:** Protected routes prevent unauthorized URL-based access.

---

## 📄 Key Modules & Functionalities

### 1. Unified Dashboard
The central hub for quality metrics.
- **KPI Cards:** Real-time counters for pending approvals, open deviations, pending training, etc.
- **My Tasks:** A tailors list of workflow items assigned specifically to the logged-in user.
- **Smart Quick Actions:** Context-aware buttons for common tasks (New Doc, Log Deviation) restricted by role.

### 2. Document Management System (DMS)
Manages SOPs, policies, and controlled documents with full lifecycle support.
- **Workflow:** `Draft` → `Review` → `Approved` → `Effective` → `Obsolete`.
- **Versioning:** Automated version increments (v1.0 → v1.1 → v2.0) and version history comparison.
- **Departmental Isolation:** Documents are categorized and filtered by department.

### 3. Quality & Incident Management
Tracks non-conformities and corrective improvements.
- **Deviations:** Log incidents with severity (Minor, Major, Critical), perform root-cause analysis, and link to CAPA.
- **CAPA (Corrective and Preventive Action):** Manage corrective plans, upload evidence, and verify effectiveness.
- **Change Control:** Formal management of modifications to validated processes or systems.

### 4. Learning Management (Training)
Ensures employees are qualified for their roles.
- **Training Matrix:** Automated mapping of roles to required SOPs.
- **Progress Tracking:** Individual training profiles with completion metrics.
- **Retraining:** Triggers automatically when a document version changes.

---

## ⚙️ Workflow Engine & Compliance

### Standardized Workflow
All quality modules share a unified engine that enforces:
- Status lifecycle transitions.
- Role-based approval routing.
- Transition validation rules.
- Workflow timeline visualization.

### E-Signature & Audit Trail
- **E-Signature:** Username/password re-authentication for approvals (compliant with electronic record standards).
- **Audit Trail:** immutable, field-level change tracking including the user, timestamp, and "reason for change."

---

## 📂 Project Structure

```text
QMS-Software/
├── frontend/               # React client built with TypeScript/Vite
│   ├── src/
│   │   ├── app/            # Context Providers & Routing
│   │   ├── components/     # Common UI & Layouts
│   │   ├── config/         # Central Permission Matrix
│   │   ├── services/       # API & Permission services
│   │   └── pages/          # Dashboard, DMS, Auth, etc.
├── backend/                # Django server with modular apps
│   ├── core/               # Project settings
│   ├── accounts/           # Auth, User model & Roles
│   ├── dms/                # Document Management logic
│   ├── quality/            # Deviations, CAPA, Change Control
│   └── training/           # LMS & Training matrix
```

---

## ⚙️ Setup Instructions

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Roadmap (Next Steps)
- [ ] **Audit Trail Export:** Backend-integrated PDF/Excel export for regulators.
- [ ] **Profile Management:** Detailed user profiles and preference settings.
- [ ] **Advanced Analytics:** Chart-based reporting for quality metrics.
- [ ] **Batch Records:** Integration of batch production records with the QMS.

---

**Developed for:** High-compliance and inspection-ready pharmaceutical operations.
**License:** Private / Proprietary
