# NexGen Pharma QMS - Module Documentation 📚

This document details the internal working, logic flow, and architecture of each module within the NexGen Pharma Quality Management System (QMS).

---

## 🔐 1. Authentication Module

The entry point of the application, handling identity verification and session management.

### How it Works (Frontend)

#### Login Flow (`LoginPage.tsx`):

- **User submits credentials.**
- **App sends a POST request** to `/api/auth/login/`.
- **On success**, the backend returns: `{ access, refresh, role, username }`.
- **Storage:** The access token is stored in `localStorage` under the key `"auth_token"`.
- **Context:** The `RoleProvider` updates the global application state with the user's role (e.g., "Admin", "Viewer").
- **Redirect:** User is redirected to the Dashboard via `useNavigate`.

#### Signup Flow (`SignupPage.tsx`):

- **Dual-Step Process:**
  1.  **Register:** Submits user details to `/api/auth/register/` with a default role of "Viewer" (if not specified).
  2.  **Auto-Login:** Immediately triggers the Login API using the just-registered credentials to fetch the token.
- **Why?** This prevents the user from being redirected to the Login page after signup, providing a seamless "Sign up and go" experience.

#### Route Protection (`ProtectedRoute.tsx`):

- Wraps all internal routes.
- Checks if `auth_token` exists in `localStorage`.
- **If missing** → Redirects to `/login`.
- **If present** → Renders the child component (Dashboard, DMS, etc.).

### How it Works (Backend)

- **Custom User Model:** Extends Django's `AbstractUser` to include `role`, `department`, and `employee_id`.
- **JWT Implementation:** Uses `SimpleJWT`.
- **Custom Serializer:** `CustomTokenObtainPairSerializer` injects the user's role and department into the login response payload, ensuring the frontend has immediate access to permissions without a second API call.

---

## 🛡 2. Role-Based Access Control (RBAC) System

The security kernel that decides "Who can do what."

### Architecture

The system uses a **Matrix-Based Permission Model**.

#### Configuration (`src/config/permissions.ts`):

A constant object `ROLE_PERMISSIONS` maps every Role to a list of allowed Modules and Actions.

**Example:**

```typescript
Viewer: {
   dashboard: ["view"], // Can only see dashboard
   dms: ["view"]        // Can only read docs
}
QA: {
   dms: ["view", "create", "approve"] // Can create and approve
}
```

#### Permission Service (`src/services/permission.service.ts`):

- Exposes a central method: `can(role, module, action)`.
- **Logic:**
  1.  Checks if the user has a valid Role.
  2.  Looks up the Role in the Matrix.
  3.  Checks if the specific Module (e.g., "dms") exists for that Role.
  4.  Checks if the specific Action (e.g., "create") is in the allowed list.
  5.  Returns `true` (Access Granted) or `false` (Access Denied).

#### UI Integration:

- **Hiding Elements:** Buttons like "New Document" are conditionally rendered:
  ```tsx
  {
    permissionService.can(role, "dms", "create") && <Button>Create</Button>;
  }
  ```
- **Blocking Navigation:** If a user tries to type a URL manually (e.g., `/dms/new`), the page component checks permissions on mount and shows a "Permission Denied" dialog if the check fails.

---

## 📊 3. Dashboard Module

The operational hub providing real-time oversight.

### Key Features

- **KPI Cards:**
  - Displays high-level metrics (Pending Approvals, Open Deviations).
  - **Logic:** Currently accepts static data, designed to eventually fetch aggregate counts from backend endpoints (e.g., `/api/dms/stats/`).
- **"My Tasks" List:**
  - A filtered view of workflow items assigned specifically to the logged-in user.
  - **Columns:** Task ID, Description, Status, Priority, Due Date.
- **Smart Quick Actions:**
  - A grid of action buttons (New Doc, Log Deviation, etc.).
  - **Dynamic Visibility:** The "Quick Actions" panel is completely hidden for "Viewer" roles to reduce UI clutter.
  - **Permission Check:** Clicking a button runs a realtime permission check. If a user somehow clicks a button they shouldn't (e.g., via a glitch), a "Permission Denied" modal intercepts the action.

---

## 📄 4. Document Management System (DMS) Module

Handles the lifecycle of Standard Operating Procedures (SOPs) and Policies.

### Workflow Logic

- **States:** `Draft` → `Review` → `Approved` → `Effective` → `Obsolete`.

### Filtering (`DmsListPage.tsx`):

- **Client-Side Search:** Filters documents by ID or Title.
- **Robustness Fix:** The search logic explicitly converts numeric IDs to strings before comparison (`String(doc.id).toLowerCase()`) to prevent app crashes when searching for "15".

### Role logic in DMS:

- **Authors:** Can create/edit "Drafts".
- **QA:** Can transition items from "Review" to "Approved".
- **Viewers:** Can only see "Effective" documents (logic to be enforced in backend query sets).

---

## ⚠️ 5. Quality Events (Deviations & CAPA)

Modules for tracking non-conformances and corrective actions.

### Current Implementation

#### Deviations:

- Used when a process deviates from the approved SOP.
- **Permissions:** "Production" and "Warehouse" roles have specific access here to raise deviations, while "QA" has access to review/close them.

#### CAPA (Corrective and Preventive Action):

- Linked to Deviations.
- **Logic:** Critical integration point where an "Investigation" phase determines root cause.
- **Access:** Heavily restricted to QA and Admin roles for closure.

---

## ⚙️ Backend Architecture (Django)

The server-side logic powering the data.

### Models (`core/api/models.py`):

- **User:** Stores the Role enum.
- **Role Enum:** `ADMIN`, `QA`, `QC`, `PRODUCTION`, `WAREHOUSE`, `VIEWER`.
- **Defaulting:** The role field defaults to `User.Role.VIEWER` at the database level, ensuring data integrity even if the API payload is incomplete.

### Serializers (`core/api/serializers.py`):

- **Registration:** Handles password hashing and user creation. It strictly uses `User.Role.VIEWER` (the Enum value) rather than a hardcoded string, ensuring case-sensitivity matches the frontend config.
- **Login:** Returns the JWT pair + User Context.

### Settings:

- **AUTH_USER_MODEL:** Pointed to `api.User` to override the default Django auth system.
- **CORS:** Configured to allow requests from the React frontend (`localhost:5173`).
