# Dedicated CI/CD Automation & DevOps Pipeline Guide

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**SE Stage:** Stage 5 - Continuous Integration & Continuous Deployment (CI/CD)  
**Dedicated Tool Options:** **Jenkins** (via declarative `Jenkinsfile`) & **GitLab CI/CD** (via `.gitlab-ci.yml`)  

---

## 1. Why a Dedicated CI/CD Tool is Distinct from GitHub

In modern software engineering tool exploration:
- **GitHub** serves as the **Source Code Management (SCM) & Version Control System** (commits, branching, pull requests, issue traceability).
- **Jenkins / GitLab CI** serves as the **Dedicated CI/CD Automation Server**, managing build triggers, test pipelines, quality gates, and automated deployment handoffs.

```
┌─────────────────────────┐          Webhook           ┌─────────────────────────┐
│     STAGE 4: GITHUB     │ ─────────────────────────► │  STAGE 5: JENKINS / CD  │
│  (Source Code & Commits)│                            │  (Automated Pipeline)   │
└─────────────────────────┘                            └────────────┬────────────┘
                                                                    │
                    ┌───────────────────────────────────────────────┴───────────────────────────────────────────────┐
                    │                                                                                               │
                    ▼                                                                                               ▼
┌───────────────────────────────────────┐                                               ┌───────────────────────────────────────┐
│       CONTINUOUS INTEGRATION (CI)     │                                               │       CONTINUOUS DEPLOYMENT (CD)      │
│  1. Checkout code from Git repository │                                               │  4. SonarQube Quality Gate Check      │
│  2. Install dependencies in parallel  │                                               │  5. Package Production Build Bundle   │
│  3. Push SQLite DB & Run Vitest Tests │                                               │  6. Deploy to Staging / Web Server    │
│     (8 Integration Suites FR-01..10)  │                                               │  7. Dispatch Webhook Alert to Slack   │
└───────────────────────────────────────┘                                               └───────────────────────────────────────┘
```

---

## 2. The 6-Stage Jenkins Declarative Pipeline (`Jenkinsfile`)

| Stage | Action | Commands Executed | What it Proves in Software Engineering |
| :--- | :--- | :--- | :--- |
| **1. Checkout** | Pulls latest code from Git | `checkout scm` | Verifies repository connectivity and branch integrity. |
| **2. Install Deps** | Parallel npm installation | `dir('backend') { npm ci }`<br>`dir('frontend') { npm ci }` | Validates clean dependency resolution without cache corruption. |
| **3. Test & DB (CI)**| Generates Prisma schema, seeds test data, and runs 8 Vitest suites | `npx prisma db push`<br>`npm run db:seed`<br>`npm test` | Automated verification that business logic & requirement rules (`FR-01`..`10`) pass before deployment. |
| **4. Build & Bundle** | TypeScript check & Vite build | `dir('frontend') { npm run build }` | Guarantees zero compilation errors in the UI. |
| **5. Quality Gate** | Static analysis / SonarQube check | Code coverage & vulnerability check | Ensures adherence to coding standards and security thresholds. |
| **6. Deploy (CD)** | Releases bundle to web server | Deployment command | Automated delivery without manual human intervention. |
| **Post Actions** | Dispatches status alert to Slack | Posts to `#buildflow-ci-cd-alerts` | Instant notification of build health to all engineers. |

---

## 3. How to Present Jenkins / CI/CD to "Mam"

When you reach Stage 5 of your presentation:

1. **State the Tool Distinction:**
   > *"In Stage 4, we used **GitHub** for Version Control and SCM to host our code and commits. Now in Stage 5, we introduce **Jenkins** as our dedicated CI/CD Automation tool."*

2. **Explain the Automated Pipeline:**
   > *"Whenever an engineer commits code to GitHub, Jenkins automatically pulls the code, executes our 8 integration test suites against SQLite, compiles the frontend bundle, verifies our SonarQube quality gate, and deploys the build."*

3. **Demonstrate Traceability to Slack:**
   > *"Upon successful deployment, Jenkins triggers a webhook alert directly into our **Slack** `#buildflow-ci-cd-alerts` channel, closing the loop between development, testing, and team communication."*
