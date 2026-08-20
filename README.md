# BUILDFlow 🏗️
### Construction Project Management & Multi-Stakeholder Collaboration Platform

[![Software Engineering](https://img.shields.io/badge/Academic%20Stage-Implementation%20Phase-amber.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Prisma%20%7C%20SQLite-blue.svg)]()
[![Tests](https://img.shields.io/badge/Tests-8%20Passed%20(100%25)-emerald.svg)]()
[![Traceability](https://img.shields.io/badge/Traceability-FR--01%20to%20FR--10%20Mapped-purple.svg)]()

> **Academic Context:** This project represents the **Implementation Phase** of a comprehensive Software Engineering academic demonstration, translating formal Requirements Elicitation, SRS, DFDs, Data Dictionaries, and UML Models into a polished, working MVP ready for live evaluation.

---

## 📌 Executive Summary & Problem Statement

Modern civil and commercial construction projects are characterized by high fragmentation across independent stakeholders:
- **Project Owners** needing executive oversight, capital allocation, and milestone visibility.
- **Project Managers** managing critical path schedules, work breakdowns, and cross-team bottlenecks.
- **Architects & Engineers** coordinating CAD/BIM revisions, structural calculations, and sign-offs.
- **General Contractors & Site Supervisors** executing onsite work, pours, and rebar assemblies.
- **Material Suppliers** managing supply chain logistics, port shipments, and transit delays.
- **Safety Inspectors** conducting municipal code audits and non-conformance remediation.

Information silos and disconnected communication channels frequently lead to expensive schedule delays and construction defects. **BUILDFlow** centralizes and synchronizes these stakeholder workflows in a responsive, modern SaaS dashboard.

---

## ✨ Core Modules & Feature Highlights

| Module | Software Engineering Requirement | Key Functionality |
| :--- | :--- | :--- |
| **Executive Dashboard** | `FR-09` | Real-time consolidated KPIs, dynamic progress bar charts, task status donuts, and upcoming deadlines. |
| **Project Management** | `FR-01` | Multi-project portfolio overview, location tracking, budget health, and tabbed subsystem summary. |
| **Tasks & Kanban Board** | `FR-02` | Interactive Kanban task board (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), priorities, and assignees. |
| **Schedule & Timeline** | `FR-03` | Milestone chronology and task prerequisite dependency chain visualization. |
| **Design Document Approvals** | `FR-04`, `FR-05` | Architectural CAD blueprint revision tracking with realistic PE engineering review and sign-off workflow. |
| **Material Supply Chain** | `FR-06` | Material catalog, batch request procurement, and delayed shipment port hold alerts. |
| **Quality & Safety Inspections**| `FR-07` | Onsite inspection logs (`PASSED`, `FAILED`, `PENDING`) with non-compliance alerts. |
| **Issues & Risk Tracking** | `FR-08` | Defect logging with severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and remediation notes. |
| **Performance Reports** | `FR-10` | Portfolio health matrices, inspection pass rate analytics, and CSV data export simulation. |
| **Team Directory** | `FR-01` | Stakeholder directory with workload balancing and role credentials. |
| **Audit & Activity Log** | `NFR-01` | Immutable chronological audit trail recording every actor, entity, action, and timestamp. |
| **Role-Aware Auth Switcher** | `NFR-02` | 1-click persona switcher supporting all 8 construction disciplines. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend:** Node.js, Express, TypeScript, tsx, CORS, Dotenv, Zod
- **Database & ORM:** SQLite (embedded local file), Prisma ORM
- **Testing:** Vitest, Supertest
- **Monorepo Tooling:** Concurrently

---

## 🚀 Quick Start Guide (1-Command Setup)

### Prerequisites
- Node.js (v18.0.0 or v20.0.0+)
- npm (v9.0.0+)

### 1-Line Setup and Startup
From the project root directory, run:

```bash
# 1. Install all dependencies for root, backend, and frontend
npm run install:all

# 2. Push database schema and seed realistic construction data
npm run db:setup

# 3. Start both backend API (Port 5000) and frontend UI (Port 5173) concurrently
npm run dev
```

- **Frontend Application:** [`http://localhost:5173`](http://localhost:5173)
- **Backend Health Check:** [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## 👥 Seeded Demo Stakeholder Personas

The application includes 8 pre-seeded realistic stakeholders ready for live demonstration:

| Stakeholder Name | Role | Email | Key Focus |
| :--- | :--- | :--- | :--- |
| **Alex Vance** | `PROJECT_MANAGER` | `alex.pm@buildflow.dev` | Master schedule, project progress, task allocation |
| **Marcus Brody** | `ENGINEER` | `marcus.eng@buildflow.dev` | Structural calculation review & blueprint sign-off |
| **Sophia Chen** | `ARCHITECT` | `sophia.arch@buildflow.dev` | BIM drawings & revision versioning |
| **David Miller** | `CONTRACTOR` | `david.contractor@buildflow.dev` | Work execution & Kanban milestone tasks |
| **Carlos Mendez** | `SITE_SUPERVISOR` | `carlos.site@buildflow.dev` | Onsite coordination & critical hazard logging |
| **Elena Rostova** | `SUPPLIER` | `elena.supplier@buildflow.dev` | Rebar & concrete deliveries, transit delay reporting |
| **Frank Reynolds** | `INSPECTOR` | `frank.inspector@buildflow.dev` | Fire barrier & concrete compression safety audits |
| **Arthur Pendelton**| `PROJECT_OWNER` | `arthur.owner@buildflow.dev` | Portfolio investment ROI & executive reports |

---

## 🧪 Automated Integration Tests

Run the automated backend test suite:

```bash
npm run test
```

Verifies:
- Health check and demo stakeholder retrieval
- Project creation and dynamic progress calculation
- Task status transitions from `TODO` to `IN_PROGRESS` and `DONE`
- Design blueprint approval and rejection workflow
- Material supply chain status updates to `DELAYED`
- Issue severity assignment and logging
- Dashboard KPI aggregation

---

## 📑 Software Engineering Artifacts Reference

- 📋 **[REQUIREMENTS.md](REQUIREMENTS.md):** Complete Software Requirements Specification (SRS), functional requirements FR-01..10, NFR-01..04, and Requirements Traceability Matrix (RTM).
- 🏛️ **[ARCHITECTURE.md](ARCHITECTURE.md):** System architecture diagram, sequence diagrams for design sign-offs & material delays, and state machine lifecycles.
- 🗄️ **[DATABASE.md](DATABASE.md):** Data Dictionary, Entity Relationship (ER) diagrams, and database table schemas.
- ⚙️ **[SETUP.md](SETUP.md):** Detailed step-by-step developer installation and configuration instructions.
- 🎬 **[DEMO.md](DEMO.md):** Exact 19-step Presentation Scenario Guide matching the live demonstration workflow.

---

## 🎯 Suggested Future Improvements

While BUILDFlow provides a complete, working MVP for software engineering demonstration, future production enhancements could include:
1. **Interactive 3D BIM Viewer:** Three.js / IFC.js integration for in-browser 3D model markup and clash detection.
2. **IoT Sensor Ingestion:** Real-time WebSocket streaming from onsite concrete maturity sensors and weather stations.
3. **Mobile Offline Sync:** Progressive Web App (PWA) with IndexedDB sync for offline site inspections in sub-grade basements.
4. **Automated RFIs (Requests for Information):** Direct linking between drawing revisions and contractor RFIs.
