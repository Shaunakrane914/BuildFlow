# Live Presentation & Demonstration Scenario Guide

**Project:** BUILDFlow - Construction Project Management & Collaboration Platform  
**Target Duration:** 5 – 10 Minutes  
**Demonstration Focus:** Software Engineering Requirements Traceability (FR-01 through FR-10) & Multi-Stakeholder Collaboration  

---

## Pre-Demo Checklist

1. Start the application:
   ```bash
   npm run dev
   ```
2. Open your browser to **`http://localhost:5173`**
3. Ensure the database is in its freshly seeded state (`npm run db:setup` if needed).

---

## Step-by-Step 19-Point Demonstration Script

| Step # | Action & Persona | UI Location & What to Click | What to Explain to the Audience | Requirement Trace |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Initial Access** | Navigate to `http://localhost:5173/login`. Click on **Alex Vance (Project Manager)**. | *"We begin by logging in as the Senior Project Manager. Notice our role-aware portal supports all 8 key construction stakeholders."* | `FR-01`, `NFR-02` |
| **2** | **Executive Dashboard** | Automatically lands on `/`. | *"The dashboard unifies high-level KPIs across active projects, milestone task completion rates, blueprint approvals, and open issues."* | `FR-09` |
| **3** | **Project Progress Metrics** | Point out the **Project Completion Progress** bar chart and **Task Status Breakdown** donut chart. | *"Progress is computed from real underlying task states rather than static figures. Notice Skyline Tower is at 68% progress."* | `FR-01`, `FR-09` |
| **4** | **Open Tasks** | Click **"Tasks (Kanban)"** in the left sidebar (`/tasks`). | *"Here is the interactive Kanban board with work packages organized across Backlog, To Do, In Progress, In Review, and Done."* | `FR-02` |
| **5** | **Move Task TODO ➔ IN PROGRESS** | Find task **`TSK-104` (MEP Riser & HVAC Ducting Integration)** in the **To Do** column. Click the **`In Prog`** quick-move button. | *"We immediately move the MEP ducting task into 'In Progress'. The UI updates optimistically, recalculating the project completion progress."* | `FR-02` |
| **6** | **Task Assignment & Deadline** | Click on task **`TSK-103` (Structural Steel Decking)** to open the details modal. | *"Notice task TSK-103 is assigned to David Miller (General Contractor) with a high priority rating and a clear target due date."* | `FR-02`, `FR-03` |
| **7** | **Open Design Documents** | Click **"Design Documents"** in the left sidebar (`/designs`). | *"The engineering design module manages architectural CAD/BIM blueprints with formal revision versioning and sign-off workflows."* | `FR-04` |
| **8** | **Show Pending Blueprint** | Point to drawing **`DSG-102` (Level 12-24 HVAC & MEP Layouts v2.1)** marked with the yellow **`UNDER REVIEW`** badge. | *"Architect Sophia Chen has uploaded revision 2.1 to resolve duct clearances. It is currently awaiting review by the Structural Engineer."* | `FR-04`, `FR-05` |
| **9** | **Switch Role to Engineer** | Click the **Persona Switcher** in the top-right navbar. Select **Marcus Brody (Engineer)**. | *"In seconds, we switch personas to Marcus Brody, Lead Structural Engineer (PE). Notice how the UI adapts to our engineer role."* | `NFR-02` |
| **10** | **Approve the Blueprint** | On blueprint `DSG-102`, click **"Conduct Engineering Review"**. In the review modal, verify the calculation remarks, then click **"Approve & Certify Design"**. | *"The engineer validates the calculations and approves the drawing. A certified DesignReview record is stored with calculation remarks."* | `FR-05` |
| **11** | **Show Updated Status** | Observe that `DSG-102` now displays the green **`APPROVED`** badge with sign-off details. | *"The status instantly updates to APPROVED, an alert notification is dispatched to the architect, and the action is recorded."* | `FR-05` |
| **12** | **Open Materials** | Click **"Materials & Supply"** in the left sidebar (`/materials`). | *"Construction schedules depend heavily on timely deliveries of bulk steel and concrete. BuildFlow tracks the entire supply chain."* | `FR-06` |
| **13** | **Show Delayed Shipment** | Point out the red **`DELAYED`** alert card for **`REQ-101` (Grade 60 Steel Rebar)**. | *"Notice shipment REQ-101 has been flagged DELAYED with a clear port customs hold notice. This poses a risk to our upcoming Level 14 pour."* | `FR-06` |
| **14** | **Open Site Issues** | Click **"Issues Tracker"** in the left sidebar (`/issues`). | *"Because the rebar shipment is delayed, we log a high-severity site coordination issue to alert all stakeholders."* | `FR-08` |
| **15** | **Create/Update Issue** | Click **"Log New Issue"**. Enter Title: `Rebar Port Clearance Schedule Adjustment`, Severity: `HIGH`, Project: `Skyline Pinnacle Tower`. Click **"Log Site Issue"**. | *"The issue is logged, assigned to the PM for schedule mitigation, and linked to the project's risk matrix."* | `FR-08` |
| **16** | **Return to Dashboard** | Click **"Dashboard"** in the sidebar (`/`). | *"We return to the executive dashboard."* | `FR-09` |
| **17** | **Verify Synchronized Metrics** | Point out that **Pending Approvals** decreased by 1, **Open Issues** updated, and the new activities reflect our actions. | *"All dashboard metrics, donut distributions, and recent feeds have dynamically synchronized across the system in real time."* | `FR-09` |
| **18** | **Open Activity Log** | Click **"Audit & Activity Log"** in the sidebar (`/activity`). | *"Traceability is essential in software engineering. Let's inspect the system's chronological audit log."* | `NFR-01` |
| **19** | **Verify Immutable Audit Trail** | Show the top entries recording: Engineer approved `DSG-102`, Task `TSK-104` moved, and the new Issue logged with precise timestamps. | *"Every action by every stakeholder is captured with full traceability back to our functional requirements. This concludes the live demonstration."* | `NFR-01`, `FR-01..10` |

---

## Summary of Demo Accounts & Stakeholder Roles

| Stakeholder Name | Email | Role | Recommended Workflow to Show |
| :--- | :--- | :--- | :--- |
| **Alex Vance** | `alex.pm@buildflow.dev` | **Project Manager** | Executive overview, task scheduling, progress tracking |
| **Marcus Brody** | `marcus.eng@buildflow.dev` | **Engineer (PE)** | Blueprint technical calculation sign-off & approvals |
| **Sophia Chen** | `sophia.arch@buildflow.dev` | **Architect** | CAD/BIM drawing uploads & revision versioning |
| **David Miller** | `david.contractor@buildflow.dev` | **Contractor** | Work package execution & Kanban task progress |
| **Carlos Mendez** | `carlos.site@buildflow.dev` | **Site Supervisor** | Onsite risk logging & excavation oversight |
| **Elena Rostova** | `elena.supplier@buildflow.dev` | **Supplier** | Rebar/concrete logistics & delay reporting |
| **Frank Reynolds** | `frank.inspector@buildflow.dev` | **Inspector** | Safety compliance audits & fire barrier certifications |
| **Arthur Pendelton** | `arthur.owner@buildflow.dev` | **Project Owner** | Portfolio ROI, budget overview & milestone reports |
