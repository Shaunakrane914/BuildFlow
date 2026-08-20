# System Architecture Document

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**Architecture Style:** Modular Client-Server / Monorepo Architecture with Relational ORM  

---

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|                                                                                   |
|  React 18 (TypeScript) + Vite 5 + Tailwind CSS + Lucide Icons + Recharts          |
|  +-------------------+  +--------------------+  +------------------------------+  |
|  | Context Providers |  |     Page Views     |  |     Reusable Components      |  |
|  | - AuthContext     |  | - DashboardPage    |  | - Kanban Board (Tasks)       |  |
|  | - ProjectContext  |  | - ProjectsPage     |  | - Timeline Gantt (Schedule)  |  |
|  | - NotifContext    |  | - DesignsPage      |  | - Review Modal (Designs)     |  |
|  |                   |  | - MaterialsPage    |  | - Status/Priority Badges     |  |
|  |                   |  | - InspectionsPage  |  | - MetricCard & Charts        |  |
|  |                   |  | - IssuesPage       |  | - TraceBadge (SE RTM)        |  |
|  +-------------------+  +--------------------+  +------------------------------+  |
|                                     |                                             |
|                             Axios REST Client                                     |
|                       (Header: x-user-id role auth)                               |
+-------------------------------------|---------------------------------------------+
                                      | HTTP REST / JSON
+-------------------------------------v---------------------------------------------+
|                                 BACKEND LAYER                                     |
|                                                                                   |
|  Node.js + Express (TypeScript)                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | REST API Routers (/api)                                                     |  |
|  |  /auth         /projects     /tasks        /designs      /materials         |  |
|  |  /inspections  /issues       /dashboard    /reports      /activity-logs     |  |
|  +-----------------------------------------------------------------------------+  |
|  | Business Logic Controllers & Services                                       |  |
|  | - Progress Calculator (recomputes project % from completed tasks)           |  |
|  | - Multi-Stakeholder Notification Generator                                  |  |
|  | - Immutable Audit Logger (records actor, entity, action, timestamp)         |  |
|  +-----------------------------------------------------------------------------+  |
|                                     |                                             |
|                                 Prisma ORM                                        |
+-------------------------------------|---------------------------------------------+
                                      | SQLite Engine
+-------------------------------------v---------------------------------------------+
|                                 DATA LAYER                                        |
|                                                                                   |
|  SQLite Embedded Relational Database (dev.db)                                     |
|  - Users (8 Stakeholder Roles)   - Projects              - Tasks & Dependencies   |
|  - DesignDocuments & Reviews     - Materials & Requests  - Inspections            |
|  - Issues                        - Notifications         - ActivityLogs           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Stakeholder Collaboration Sequence Diagrams

### 2.1 Design Approval Workflow (FR-04, FR-05)

```
Architect (Sophia)          Frontend UI          Express Backend         Prisma / SQLite       Engineer (Marcus)
       |                         |                      |                       |                      |
       |--- Upload Blueprint --->|                      |                       |                      |
       |    (CAD v2.1 MEP)       |--- POST /designs --->|                       |                      |
       |                         |                      |--- INSERT Design ---->|                      |
       |                         |                      |--- INSERT Notif ----->|                      |
       |                         |                      |--- INSERT Audit Log ->|                      |
       |                         |<-- 201 Created ------|                       |                      |
       |                         |                      |                       |                      |
       |                         |                      |                       |                      |
       |                         |               (Switch Role to Engineer)      |                      |
       |                         |                      |                       |                      |
       |                         |<---------------------|--- GET /designs ------|<-- Open Reviews -----|
       |                         |                      |                       |                      |
       |                         |-- Click "Approve" -->|                       |                      |
       |                         |   with PE Remarks    |--- POST /review ----->|                      |
       |                         |                      |--- UPDATE Design ---->|                      |
       |                         |                      |--- INSERT Review ---->|                      |
       |                         |                      |--- INSERT Notif ----->|                      |
       |                         |                      |--- INSERT Audit Log ->|                      |
       |<--- Status: APPROVED ---|<-- 200 OK -----------|                       |                      |
```

### 2.2 Material Delay Alert & Issue Remediation (FR-06, FR-08)

```
Supplier (Elena)             Frontend UI          Express Backend         Site Supervisor        Project Manager
       |                         |                      |                       |                      |
       |--- Update Status ------>|                      |                       |                      |
       |    to DELAYED (Port)    |-- PATCH /status ---->|                       |                      |
       |                         |                      |--- UPDATE Req ------->|                      |
       |                         |                      |--- INSERT Alert Notif-|--------------------->|
       |                         |                      |                       |                      |
       |                         |                      |<-- GET /materials ----|-- Views Delayed Flag |
       |                         |                      |                       |                      |
       |                         |                      |<-- POST /issues ------|-- Logs Critical Issue|
       |                         |                      |    (Assigns to PM)    |                      |
       |                         |                      |--- INSERT Issue ----->|                      |
       |                         |                      |--- INSERT Audit Log ->|                      |
       |                         |                      |                       |                      |
```

---

## 3. Entity State Machine Lifecycles

### 3.1 Task Lifecycle
```
[ BACKLOG ] ───► [ TODO ] ───► [ IN PROGRESS ] ───► [ IN REVIEW ] ───► [ DONE ]
     ▲              │                 │                    │               │
     └──────────────┴─────────────────┴────────────────────┴───────────────┘
                     (Can be transitioned bidirectionally)
```

### 3.2 Design Document Review Lifecycle
```
[ DRAFT ] ───(Submit)───► [ UNDER REVIEW ] ───(PE Signs Off)───► [ APPROVED ]
                                │
                                └───(PE Rejection)────────────► [ REJECTED ]
```

### 3.3 Material Supply Chain Lifecycle
```
[ REQUESTED ] ───► [ ORDERED ] ───► [ IN TRANSIT ] ───► [ DELIVERED ]
                                          │
                                          └───(Port Delay)───► [ DELAYED ]
```

---

## 4. Software Design Principles Applied
1. **Separation of Concerns (SoC):** Distinct boundaries between presentation components, routing, business controllers, ORM modeling, and relational storage.
2. **Optimistic UI Updates:** Instant responsive feedback during Kanban column moves and approval status toggles before backend roundtrip completion.
3. **Single Source of Truth:** Centralized database schema defining consistent data contracts across backend and frontend TypeScript interfaces.
4. **Audit Trail Completeness:** Non-repudiation and traceability of all actions across stakeholders.
