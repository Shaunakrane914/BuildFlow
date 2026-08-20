# Software Engineering Presentation Guide
### The 5-Stage Tool Exploration & Lifecycle Journey

> **Core Presentation Thesis:**  
> *"We are not presenting a generic standalone website. We are demonstrating the complete **Software Engineering Lifecycle (SDLC)**, showing how a real-world software problem travels through discovery, formal modeling, team collaboration, implementation, and automated CI/CD delivery using specialized industry tools."*

---

## 🗺️ Presentation Overview & Tool Mapping

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: Problem Discovery & Requirements Analysis                               │
│ Tool: MIRO (Brainstorming, Interviews, DFD, Data Dictionary, SRS, Prototype)    │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: Formal System Modeling & Architectural Specification                    │
│ Tool: PLANTUML / MODELIO (Use Case, Class, Sequence, State Machine Diagrams)    │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: Team Collaboration, Scheduling & Communication                          │
│ Tool: SLACK & WORK BREAKDOWN (Channel Structure, Handoffs, Escalations)          │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: Software Implementation & Version Control                               │
│ Tool: GITHUB (Repository Structure, Traceability, Clean Commits, Prisma/React)   │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: DevOps Automation, Quality Assurance & CI/CD Pipeline                   │
│ Tool: GITHUB ACTIONS (Automated Test Execution, Build, Package, Deploy Alerts)   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎙️ Step-by-Step Presentation Script for "Mam"

### 📌 STAGE 1: Discovery & Requirements Analysis (Tool: MIRO)
- **What to show:** Open your Miro board.
- **Key Talking Points:**
  1. *"We started by exploring the construction coordination problem using Miro as our collaborative thinking workspace."*
  2. *"We conducted requirement elicitation through simulated stakeholder interviews (Architect, Engineer, Contractor, Supplier, Inspector) and brainstorming."*
  3. *"We derived Functional Requirements (FR-01 to FR-10) and Non-Functional Requirements (NFR-01 to NFR-04)."*
  4. *"We analyzed information movement through Data Flow Diagrams (DFD Level 0 & Level 1) and defined standard entity types in the Data Dictionary."*
  5. *"We built an early interactive prototype, gathered simulated stakeholder feedback, and refined our requirements into a formal Software Requirements Specification (SRS)."*

---

### 📌 STAGE 2: Formal System Modeling (Tool: PLANTUML / UML)
- **What to show:** Open PlantUML diagrams / rendered diagram artifacts.
- **Key Talking Points:**
  1. *"While Miro was used for exploratory discovery, PlantUML was used to convert those requirements into formal engineering models."*
  2. *"We developed **Class Diagrams** modeling relational entities (`User`, `Project`, `Task`, `DesignDocument`, `MaterialRequest`, `Inspection`, `Issue`, `ActivityLog`)."*
  3. *"We developed **Sequence Diagrams** demonstrating interactions between independent stakeholders (e.g., Architect submits drawing $\rightarrow$ Structural PE reviews & verifies calculations $\rightarrow$ Approval sign-off).'*
  4. *"We created **State Machine Diagrams** to govern strict lifecycles: Task states (`BACKLOG` $\rightarrow$ `DONE`), Design states (`DRAFT` $\rightarrow$ `APPROVED`), and Material supply chain states (`ORDERED` $\rightarrow$ `DELAYED` $\rightarrow$ `DELIVERED`)."*

---

### 📌 STAGE 3: Collaboration, Scheduling & Team Communication (Tool: SLACK)
- **What to show:** Explain the Slack communication & handoff structure.
- **Key Talking Points:**
  1. *"Software engineering requires structured cross-functional communication rather than fragmented emails."*
  2. *"We organized dedicated Slack collaboration channels:"*
     - `#proj-skyline-tower`: Multi-stakeholder coordination.
     - `#design-approvals`: Automated bot alerts when new CAD/BIM drawings need PE certification.
     - `#material-logistics`: Immediate alerts when material shipments are delayed at port.
     - `#site-safety-inspections`: Quality audit notifications and failed inspection alerts.
     - `#buildflow-ci-cd`: Automated build and deployment notifications.
  3. *"When an Architect uploads a drawing, an automated webhook notifies the Structural Engineer on Slack. Once approved, the Contractor is immediately notified to start the task."*

---

### 📌 STAGE 4: Implementation & Repository Structure (Tool: GITHUB)
- **What to show:** Open the GitHub repository **`https://github.com/Shaunakrane914/BuildFlow`**.
- **Key Talking Points:**
  1. *"To prove that our requirements and UML models were directly realizable, we implemented the system in a clean, production-grade GitHub repository."*
  2. *"Show the clean Git commit history (`chore`, `feat(backend)`, `fix(backend)`, `feat(frontend)`, `docs`), demonstrating incremental software development."*
  3. *"Highlight the clean architectural separation:"*
     - `backend/prisma/schema.prisma` $\rightarrow$ 1-to-1 mapping with our PlantUML Class Diagram.
     - `backend/src/controllers/` $\rightarrow$ Business logic with explicit requirement traceability tags (`FR-01` through `FR-10`).
     - `backend/tests/` $\rightarrow$ Automated integration test suite validating business rules.
     - `docs/` $\rightarrow$ Complete SRS (`REQUIREMENTS.md`), Architecture (`ARCHITECTURE.md`), and Data Dictionary (`DATABASE.md`).

---

### 📌 STAGE 5: Automated Quality Assurance & CI/CD (Tool: GITHUB ACTIONS)
- **What to show:** Open the **"Actions"** tab on your GitHub repository (`.github/workflows/ci-cd.yml`).
- **Key Talking Points:**
  1. *"Modern software engineering relies on continuous quality verification. We configured a GitHub Actions CI/CD pipeline."*
  2. *"Every push or Pull Request automatically triggers:"*
     - **Backend CI Job:** Sets up Node.js 20, pushes the SQLite schema via Prisma, seeds realistic data, and executes all 8 automated integration test suites.
     - **Frontend CI Job:** Validates TypeScript types and compiles the production bundle via Vite.
     - **CD Pipeline Job:** Verifies build artifacts, runs release readiness checks, and dispatches automated deployment notifications to Slack.
  3. *"This demonstrates end-to-end automation: an idea in Miro becomes a formal PlantUML model, which becomes manageable work in Slack/Jira, implemented on GitHub, and verified continuously by CI/CD."*

---

## 🎯 Concluding Summary Statement
> *"Our project demonstrates how each tool has a clear, distinct purpose in the software engineering pipeline: **Miro** for collaborative discovery, **PlantUML** for formal modeling, **Slack** for team coordination, **GitHub** for modular version-controlled implementation, and **GitHub Actions** for automated CI/CD quality assurance."*
