# Installation & Developer Setup Guide

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**Target Environment:** Node.js (v18+ or v20+) + npm  

---

## 1. Quick Start (1-Command Initialization)

Clone the repository and run:

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Push SQLite schema and seed realistic construction data
npm run db:setup

# 3. Launch both backend API (Port 5000) and frontend UI (Port 5173) concurrently
npm run dev
```

The application will be accessible at: **`http://localhost:5173`**  
The backend API health endpoint will be at: **`http://localhost:5000/api/health`**

---

## 2. Individual Subsystem Commands

### Backend Subsystem (`/backend`)
```bash
# Enter backend directory
cd backend

# Install backend dependencies
npm install

# Push database schema to SQLite
npx prisma db push

# Seed realistic construction projects, stakeholders, tasks, and drawings
npm run db:seed

# Run automated backend integration test suite (Vitest)
npm test

# Run backend development server with hot-reload (tsx)
npm run dev
```

### Frontend Subsystem (`/frontend`)
```bash
# Enter frontend directory
cd frontend

# Install frontend dependencies
npm install

# Run frontend development server (Vite)
npm run dev

# Run TypeScript compilation and production bundle build
npm run build
```

---

## 3. Environment Variables Configuration

The project is pre-configured with sensible defaults for immediate evaluation.

### Backend `.env` (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CLIENT_URL="http://localhost:5173"
```

### Frontend `.env` (`frontend/.env` - optional):
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 4. Automated Testing & Verification

Run the automated integration tests anytime to verify that authentication, project creation, task Kanban status transitions, engineering blueprint approvals, and material updates function properly:

```bash
npm run test
```

Expected test output:
```text
✓ tests/api.test.ts (8 tests)
  ✓ 1. Health check endpoint responds with healthy status
  ✓ 2. Auth: Retrieves demo users for role switcher
  ✓ 3. Projects: Fetches projects and creates a new project (FR-01)
  ✓ 4. Tasks: Creates a task, transitions status, and verifies progress (FR-02, FR-03)
  ✓ 5. Design Review: Submits and approves a design document (FR-04, FR-05)
  ✓ 6. Materials: Updates delivery status to DELAYED (FR-06)
  ✓ 7. Issues: Creates an issue and verifies severity tracking (FR-08)
  ✓ 8. Dashboard Stats: Aggregates project, task, and material KPIs (FR-09)

Test Files  1 passed (1)
     Tests  8 passed (8)
```
