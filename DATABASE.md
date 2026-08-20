# Database Design & Data Dictionary

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**Database Engine:** SQLite (via Prisma ORM)  
**Location:** `backend/prisma/dev.db`  

---

## 1. Entity Relationship (ER) Diagram

```
+------------------+         1:N         +-------------------+
|      User        |-------------------->|      Project      |
|------------------|                     |-------------------|
| id (PK)          |                     | id (PK)           |
| email            |                     | code (UK)         |
| name             |                     | name              |
| role             |                     | location          |
| department       |                     | budget            |
| avatar           |                     | managerId (FK)    |
+------------------+                     | ownerId (FK)      |
      |   |   |                          +-------------------+
      |   |   |                                    | 1:N
      |   |   |            +-----------------------+------------------------+
      |   |   |            |                       |                        |
      |   |   |            v                       v                        v
      |   |   |    +---------------+       +------------------+     +----------------+
      |   |   +--->|     Task      |       |  DesignDocument  |     |    Material    |
      |   |        |---------------|       |------------------|     |----------------|
      |   |        | id (PK)       |       | id (PK)          |     | id (PK)        |
      |   |        | code (UK)     |       | code (UK)        |     | code (UK)      |
      |   |        | title         |       | title            |     | name           |
      |   |        | priority      |       | category         |     | totalQuantity  |
      |   |        | status        |       | version          |     | unitCost       |
      |   |        | progress      |       | status           |     | projectId (FK) |
      |   |        | projectId(FK) |       | uploaderId (FK)  |     +----------------+
      |   |        | assigneeId(FK)|       | reviewerId (FK)  |             | 1:N
      |   |        +---------------+       +------------------+             v
      |   |                | 1:N                   | 1:N            +----------------+
      |   |                v                       v                |MaterialRequest |
      |   |        +---------------+       +------------------+     |----------------|
      |   |        |TaskDependency |       |   DesignReview   |     | id (PK)        |
      |   |        |---------------|       |------------------|     | code (UK)      |
      |   |        | taskId (FK)   |       | designId (FK)    |     | materialId(FK) |
      |   |        | prereqId (FK) |       | reviewerId (FK)  |     | supplierId(FK) |
      |   |        +---------------+       | status, remarks  |     | status, qty    |
      |   |                                +------------------+     +----------------+
      |   |
      |   |        +--------------------+       +--------------------+
      |   +------->|     Inspection     |       |       Issue        |
      |            |--------------------|       |--------------------|
      |            | id (PK), code (UK) |       | id (PK), code (UK) |
      |            | projectId (FK)     |       | projectId (FK)     |
      |            | inspectorId (FK)   |       | title, severity    |
      |            | area, result, notes|       | status, reportedBy |
      |            +--------------------+       +--------------------+
      |
      |            +--------------------+       +--------------------+
      +----------->|    Notification    |       |    ActivityLog     |
                   |--------------------|       |--------------------|
                   | id, userId (FK)    |       | id, userId (FK)    |
                   | type, title, read  |       | projectId, action  |
                   +--------------------+       +--------------------+
```

---

## 2. Detailed Data Dictionary

### 2.1 Table: `User`
Stores system stakeholders across all 8 construction disciplines.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique user identifier (`u-pm`, `u-eng`, etc.) |
| `email` | String | No | UK | Login and correspondence email address |
| `name` | String | No | - | Full name of stakeholder (e.g. "Alex Vance") |
| `role` | String | No | - | `PROJECT_OWNER`, `PROJECT_MANAGER`, `ARCHITECT`, `ENGINEER`, `CONTRACTOR`, `SITE_SUPERVISOR`, `SUPPLIER`, `INSPECTOR` |
| `title` | String | No | - | Professional title (e.g. "Lead Structural Engineer (PE)") |
| `department`| String | No | - | Organizational unit (e.g. "Structural Engineering") |
| `phone` | String | Yes | - | Direct contact telephone number |
| `avatar` | String | Yes | - | Profile portrait photograph URL |

### 2.2 Table: `Project`
Stores master project records and aggregated health statistics.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique project identifier (`prj-101`, etc.) |
| `code` | String | No | UK | Display project code (`PRJ-101`) |
| `name` | String | No | - | Project name (e.g. "Skyline Pinnacle Tower") |
| `description`| String | No | - | Detailed structural scope description |
| `location` | String | No | - | Physical site location / address |
| `clientName`| String | No | - | Client / developer organization |
| `budget` | Float | No | - | Total authorized budget in USD |
| `startDate` | DateTime | No | - | Scheduled groundbreaking date |
| `endDate` | DateTime | No | - | Target commissioning / handover date |
| `status` | String | No | - | `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED` |
| `progress` | Int | No | - | Aggregated progress percentage (0 - 100%) |
| `managerId` | String (FK) | No | FK | Reference to `User.id` (Project Manager) |
| `ownerId` | String (FK) | No | FK | Reference to `User.id` (Project Owner) |

### 2.3 Table: `Task` & `TaskDependency`
Stores work packages, assigned contractors, priorities, and precedence constraints.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique task identifier |
| `code` | String | No | UK | Work package code (`TSK-101`) |
| `title` | String | No | - | Short descriptive task summary |
| `description`| String | No | - | Detailed scope of work |
| `projectId` | String (FK) | No | FK | Reference to `Project.id` (Cascade delete) |
| `assigneeId`| String (FK) | Yes | FK | Reference to `User.id` |
| `priority` | String | No | - | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `status` | String | No | - | `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE` |
| `progress` | Int | No | - | Task completion percent (0 - 100%) |
| `startDate` | DateTime | No | - | Work commencement date |
| `dueDate` | DateTime | No | - | Milestone completion deadline |
| `completedAt`| DateTime | Yes | - | Actual completion timestamp |

### 2.4 Table: `DesignDocument` & `DesignReview`
CAD/BIM engineering drawing archives with formal sign-off decisions.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique design drawing ID |
| `code` | String | No | UK | Drawing blueprint number (`DSG-102`) |
| `title` | String | No | - | Title (e.g. "Level 12-24 HVAC & MEP Layouts") |
| `category` | String | No | - | `Structural`, `Architectural`, `MEP`, `Civil`, `Facade` |
| `version` | String | No | - | Revision designation (`1.0`, `2.1`, etc.) |
| `status` | String | No | - | `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `REJECTED` |
| `projectId` | String (FK) | No | FK | Reference to `Project.id` |
| `uploadedById`| String (FK)| No | FK | Reference to `User.id` (Architect) |
| `reviewerId`| String (FK) | Yes | FK | Reference to `User.id` (Engineer) |
| `approvedAt`| DateTime | Yes | - | Timestamp of PE approval sign-off |

### 2.5 Table: `Material` & `MaterialRequest`
Procurement catalog and logistics delivery tracking.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique request ID |
| `code` | String | No | UK | Procurement batch code (`REQ-101`) |
| `materialId`| String (FK) | No | FK | Reference to `Material.id` |
| `projectId` | String (FK) | No | FK | Reference to `Project.id` |
| `quantity` | Float | No | - | Ordered quantity (e.g. 120 Tons) |
| `supplierId`| String (FK) | Yes | FK | Reference to `User.id` (Supplier) |
| `status` | String | No | - | `REQUESTED`, `ORDERED`, `IN_TRANSIT`, `DELIVERED`, `DELAYED` |
| `notes` | String | Yes | - | Port delay notices, customs tracking |

### 2.6 Table: `Inspection`
Municipal and site safety compliance audits.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique inspection record ID |
| `code` | String | No | UK | Audit serial code (`INS-002`) |
| `projectId` | String (FK) | No | FK | Reference to `Project.id` |
| `inspectorId`| String (FK)| No | FK | Reference to `User.id` (Inspector) |
| `area` | String | No | - | Site location (e.g. "Level 8 Fire Barriers") |
| `checkCategory`| String | No | - | `Structural`, `Safety`, `MEP`, `Environmental` |
| `result` | String | No | - | `PASSED`, `FAILED`, `PENDING` |
| `notes` | String | No | - | Detailed findings & remediation requirements |

### 2.7 Table: `Issue`
Hazard logging, clash tracking, and risk resolution.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique issue record ID |
| `code` | String | No | UK | Ticket number (`ISS-001`) |
| `projectId` | String (FK) | No | FK | Reference to `Project.id` |
| `title` | String | No | - | Summary of hazard / disruption |
| `severity` | String | No | - | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | String | No | - | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `reportedById`| String (FK)| No | FK | Reference to `User.id` |
| `assignedToId`| String (FK)| Yes | FK | Reference to `User.id` |
| `resolutionNotes`| String | Yes | - | Remediation summary upon closure |

### 2.8 Table: `ActivityLog`
Immutable audit trail ensuring full system accountability.

| Field Name | Type | Nullable | Key | Description / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (UUID) | No | PK | Unique audit log ID |
| `userId` | String (FK) | No | FK | Reference to `User.id` (Actor) |
| `projectId` | String (FK) | Yes | FK | Reference to `Project.id` |
| `action` | String | No | - | `APPROVED_DESIGN`, `MOVED_TASK`, `LOGGED_ISSUE`, etc. |
| `entityType`| String | No | - | `TASK`, `DESIGN`, `MATERIAL`, `INSPECTION`, `ISSUE`, `PROJECT` |
| `details` | String | No | - | Human-readable audit description |
| `createdAt` | DateTime | No | - | High-precision audit timestamp |
