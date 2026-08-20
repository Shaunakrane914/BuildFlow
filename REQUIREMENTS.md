# Software Requirements Specification (SRS) & Traceability Matrix

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**Academic Context:** Software Engineering Demonstration (Implementation Phase)  
**Version:** 1.0.0  

---

## 1. Introduction & Problem Statement

Large-scale construction and civil engineering projects suffer from severe fragmentation across multiple independent stakeholders—Owners, Project Managers, Architects, Structural Engineers, General Contractors, Site Supervisors, Material Suppliers, and Quality Inspectors. 

Information silos, delayed blueprint approvals, unmonitored material logistics bottlenecks, and undocumented site safety non-conformances frequently cause massive cost overruns and schedule delays.

**BUILDFlow** provides a centralized, collaborative platform unifying project management, milestone task scheduling, CAD/BIM drawing approval workflows, material supply chain tracking, safety inspection logs, and immutable audit trails.

---

## 2. Functional Requirements (FR)

| Req ID | Module | Description | Inputs | Primary Stakeholders | Outputs & System Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **Project Management** | Create, view, update, and manage construction projects with location, budget, client info, and milestone progress. | Project Name, Location, Budget, Client, Start/End Dates | Project Owner, Project Manager | Creates new Project entity; computes overall progress based on task completion percentage. |
| **FR-02** | **Task Management** | Create work packages, assign to team members, set due dates and priority levels, and transition across Kanban columns. | Title, Description, Assignee, Priority, Status, Due Date | Project Manager, Contractor, Site Supervisor | Displays tasks on Kanban board (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`); updates task progress. |
| **FR-03** | **Schedule & Timeline** | View chronological milestone timeline and visualize task prerequisite dependencies. | Start Date, Due Date, Dependency Link | Project Manager, Engineer, Contractor | Renders Gantt-style schedule view; enforces and highlights prerequisite task chains. |
| **FR-04** | **Design Document Management** | Upload CAD/BIM architectural blueprints with revision versioning and discipline metadata. | Drawing Title, Category, Version, File Metadata, Reviewer | Architect | Stores design record with status `UNDER_REVIEW`; generates real-time review notification for assigned PE. |
| **FR-05** | **Design Review & Approval** | Review submitted blueprints, enter engineering calculation remarks, and certify (`APPROVED`) or `REJECTED`. | Decision (`APPROVED`/`REJECTED`), Calculation Remarks | Structural Engineer (PE), Project Manager | Updates design status; creates immutable `DesignReview` record; notifies Architect; updates project health. |
| **FR-06** | **Material & Supply Chain** | Manage material inventory catalog, issue procurement batch requests, track transit, and flag delayed deliveries. | Material Name, Unit, Quantity, Supplier, Expected Date, Status | Project Manager, Supplier, Contractor | Displays delivery pipeline (`REQUESTED`, `ORDERED`, `IN_TRANSIT`, `DELIVERED`, `DELAYED`); triggers delay warning banners. |
| **FR-07** | **Quality & Safety Inspections** | Record onsite inspection audits with area locations, check categories, and verdicts (`PASSED`, `FAILED`, `PENDING`). | Area/Grid, Category, Verdict, Findings, Date | Municipal Safety & Quality Inspector | Stores audit record; automatically flags safety alerts on failed fire barrier / structural tests. |
| **FR-08** | **Issue & Hazard Tracking** | Log site defects, port logistics holds, or design clashes with severity levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). | Title, Description, Severity, Assigned Lead | Site Supervisor, Engineer, Inspector, PM | Categorizes open issues; tracks resolution turnaround; sends assignment notifications. |
| **FR-09** | **Progress Analytics & KPIs** | Consolidate and compute real-time high-level KPIs, progress bar charts, and status distributions. | Active Project IDs, Task States, Material States | Project Owner, Project Manager | Renders executive charts (Progress by Project, Task Distribution Donut, Material Status Pipeline). |
| **FR-10** | **Reporting & Data Export** | Generate comprehensive construction health matrices and export executive performance summaries. | Filter parameters | Project Owner, Project Manager | Generates summary reports; exports printable views and CSV data sheets. |

---

## 3. Non-Functional Requirements (NFR)

| Req ID | Category | Specification | Verification Method |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Traceability & Auditability** | Every critical stakeholder action (login, task move, design approval, material update, issue log) must be recorded in an immutable `ActivityLog`. | Audit Trail page (`/activity`) & automated test logs. |
| **NFR-02** | **Role-Based Usability** | UI must support rapid persona switching between 8 construction roles with customized contextual permissions and badges. | Quick Stakeholder Switcher in Navbar & Role Badges. |
| **NFR-03** | **Performance & Responsiveness** | All dashboard analytics and Kanban status updates must respond in < 200ms with optimistic UI feedback. | Sub-second API responses over SQLite & Vitest benchmark. |
| **NFR-04** | **Data Integrity & Consistency** | Relational integrity must be maintained across cascading project tasks, dependencies, design reviews, and procurement requests. | Prisma ORM foreign key constraints and SQLite transactional guarantees. |

---

## 4. Requirements Traceability Matrix (RTM)

| Requirement ID | Backend Controller / Route | Frontend Component / Page | Database Entity | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | `projectController.ts` (`/api/projects`) | `ProjectsPage.tsx`, `ProjectDetailPage.tsx` | `Project`, `User` | Verified ✓ |
| **FR-02** | `taskController.ts` (`/api/tasks`) | `TasksPage.tsx` (Kanban Board) | `Task` | Verified ✓ |
| **FR-03** | `taskController.ts` (`/api/tasks`) | `SchedulePage.tsx` (Timeline Gantt) | `TaskDependency` | Verified ✓ |
| **FR-04** | `designController.ts` (`/api/designs`) | `DesignsPage.tsx` | `DesignDocument` | Verified ✓ |
| **FR-05** | `designController.ts` (`/api/designs/:id/review`) | `DesignsPage.tsx` (Review Modal) | `DesignReview` | Verified ✓ |
| **FR-06** | `materialController.ts` (`/api/materials`) | `MaterialsPage.tsx` | `Material`, `MaterialRequest` | Verified ✓ |
| **FR-07** | `inspectionController.ts` (`/api/inspections`) | `InspectionsPage.tsx` | `Inspection` | Verified ✓ |
| **FR-08** | `issueController.ts` (`/api/issues`) | `IssuesPage.tsx` | `Issue` | Verified ✓ |
| **FR-09** | `dashboardController.ts` (`/api/dashboard/stats`) | `DashboardPage.tsx` | Consolidated Aggregates | Verified ✓ |
| **FR-10** | `reportController.ts` (`/api/reports`) | `ReportsPage.tsx` | Performance Summary | Verified ✓ |
| **NFR-01** | `activityController.ts` (`/api/activity-logs`) | `ActivityLogPage.tsx` | `ActivityLog` | Verified ✓ |
| **NFR-02** | `authController.ts` (`/api/auth/demo-users`) | `Navbar.tsx`, `LoginPage.tsx` | `User` (8 Roles) | Verified ✓ |
