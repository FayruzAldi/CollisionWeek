# Collision Week: Academic Deadline Load Balancing and Sub-topic Peer Help

[![GDGoC ITB STACK 2026](https://img.shields.io/badge/Competition-GDGoC_ITB_STACK_2026-blue?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)
[![Case 1](https://img.shields.io/badge/Challenge-Case_1:_Smarter_Campus_&_Learning-emerald?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)
[![Deterministic Engine](https://img.shields.io/badge/Engine-100%25_Deterministic_(No_LLM)-rose?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)

> **Team:** `daftar krna gratis`
> **Target Phase:** Semifinal Submission (30 November 2026) & Final Day (16 December 2026)
> **Theme:** *"Agent of the Ocean: Vibing Beyond the Code"*
> **GitHub Repository:** [https://github.com/FayruzAldi/CollisionWeek.git](https://github.com/FayruzAldi/CollisionWeek.git)

---

## 1. Executive Summary & Problem Context

**Collision Week** is a responsive web application powered by **pure deterministic calculations** that eliminates multi-course academic deadline clustering (*deadline collision*) across a university program while pairing high-load crunch periods with structured, **sub-topic peer assistance** (*peer help*).

### The Real-World Pain Point

Deadlines across a semester are fragmented across disparate Google Classrooms, LMS instances, and WhatsApp groups. Each lecturer sets assignment due dates in a vacuum, with zero cross-course aggregated calendar visibility. Consequently, major deadlines clump into the same 1–2 weeks, leaving students sleep-deprived and overwhelmed with nowhere to turn when stuck on specific sub-topics.

### Empirical Research Evidence (Survey of 53 Students & 3 Lecturers, Nov 2026)

* **74%** of students have experienced **$\ge 3$ major assignments** due in a single week across different courses.
* **15%** of students reported having **5 or more major assignments** due simultaneously.
* **60%** of students slept **5 hours or less per day** during collision crunch weeks.
* **85%** turn to peers when stuck, but **62%** cannot identify who in their class has mastered the specific sub-topic they are blocked on.
* **3 university lecturers** confirmed that cross-course scheduling coordination is currently informal, and expressed strong demand for a system proposing **minimal date shifts** with one-click lecturer approval.

---

## 2. Core Functional Architecture

### Layer 1: Deterministic Load Balancing & 16-Week Heat Map

* **Assignment Weighting ($1 \dots 5$):**
  * Quiz = 1 pt
  * Lab / Practice = 2 pts
  * Structured Report = 3 pts (*Major Assignment*)
  * Group Project = 4 pts (*Major Assignment*)
  * Final Project / Exam = 5 pts (*Major Assignment*)
  * Any assignment with $\text{weight\_score} \ge 3$ is classified as a **major assignment**.
* **Collision Count Formula ($C_w$):**
  The count of unique courses having at least one major assignment due in week $w$:
  $$
  C_w = \left| \{ \text{course\_id} \mid \text{week\_number} = w \land \text{weight\_score} \ge 3 \} \right|
  $$
* **Load Index Formula ($L_w$):**
  $$
  L_w = \sum_{a \in A_w} \text{weight\_score}(a)
  $$
* **Semantic Heat Map Status:**
  * **Safe Zone ($C_w \le 1$):** Emerald green indicator.
  * **Caution Zone ($C_w = 2$):** Amber warning indicator.
  * **Collision Zone ($C_w \ge 3$):** Crimson red alert with `"Collision Week"` badge.
* **Deterministic Minimal Date Move Algorithm:**
  When week $w$ is flagged ($C_w \ge 3$), the solver evaluates candidates in nearest neighbor weeks $w' \in \{w-1, w+1, w+2\}$. It selects shifts where $C_{w'} < 3$ (ensuring no new collisions are created) and ranks them by smallest day delta. Lecturers can **Accept** with 1 click to update the database and recalculate live metrics immediately.

### Layer 2: Sub-topic Peer Assistance

* **Structured Sub-topic Tags:** Assignments feature granular sub-topic tags (e.g. Database: `#3NF Normalization`, `#B-Tree Indexing`, `#SQL Join Optimization`).
* **Whole-Class Visibility:** Inquiries are posted to all students taking the course to overcome cold-start barriers.
* **Cold-Start Highlight:** Any question open for $> 12$ hours without a response is elevated with an urgent pulsing badge: `"Needs Peer Help"`.
* **Three Inclusive Response Channels:**
  1. 📝 **Written Explanation:** Text & formatted code walkthroughs for students who prefer reading.
  2. 🎥 **Short Recorded Link:** Screen recording or voice memo URL (Loom, Drive, YouTube).
  3. ⏱️ **20-Minute Micro-Session:** Propose a 20-minute discussion slot.
* **Resolution Loop:** Both requester and helper can mark inquiries as **Resolved**, driving KPI metrics (Time to First Response and Resolution Rate).

### Layer 3: Lecturer Sub-topic Analytics

* Aggregates inquiry density per sub-topic.
* Automatically flags high-friction topics (resolution rate $< 60\%$) with pedagogical recommendations for faculty review sessions.

---

## 3. Scope Management (Semifinal vs. Final Day)

Per STACK 2026 rules, teams must reserve **2–3 substantive development tasks** for the Final Day live build session.

| Capability                                       | Semifinal Phase (30 Nov 2026)                                                                                                   | Final Day Milestone (16 Dec 2026)                                                         |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------- |
| **Database & Synthetic Data**              | **Complete:** Full relational schema with 1-semester synthetic demo dataset (16 weeks, 6 courses).                        | Extended multi-cohort cross-faculty datasets.                                             |
| **Layer 1: CSV Ingestion & Load Engine**   | **Complete:** CSV upload, Zod validation, $C_w$ & $L_w$ calculations, 16-week Heat Map, and Minimal Date Move solver. | Multi-scenario "what-if" simulations.                                                     |
| **Layer 1: PDF Syllabus & LMS Parser**     | **Transparent Mockup:** Labeled *"Planned for Final Day"*.                                                              | **Substantive Task #1:** PDF text extraction & Moodle API integration.              |
| **Layer 2: Sub-topic Peer Help**           | **Complete:** Inquiries, whole-class board, 3 response channels, resolution loop.                                         | Rich markdown editor & thread upvoting.                                                   |
| **Layer 2: 20-Min Session Auto-Scheduler** | **Manual Scheduling:** Time slot picker with *"Planned for Final Day"* notice.                                          | **Substantive Task #2:** Automated Google Calendar / timetable conflict matcher.    |
| **Layer 3: Lecturer Analytics**            | **Complete:** Sub-topic density rankings & pedagogical friction alerts.                                                   | **Substantive Task #3:** Automated PDF export of curriculum revision (RPS) reports. |

---

## 4. Tech Stack

* **Framework:** Next.js 14 (App Router) + TypeScript
* **Styling & UI:** Tailwind CSS, Lucide React, High-Contrast Semantic Palette
* **Database & ORM:** SQLite (development / demo portability) & PostgreSQL compatible schema via **Prisma ORM**
* **Validation & Parsing:** Zod (schema validation) + PapaParse (CSV processing)
* **Algorithms:** Pure deterministic mathematics (**0% AI / LLM** for scheduling)

---

## 5. Getting Started & Local Setup

### Prerequisites

* Node.js v18+ or v20+
* pnpm (or npm / yarn)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/FayruzAldi/CollisionWeek.git
cd CollisionWeek

# 2. Install dependencies
pnpm install

# 3. Synchronize database schema & seed demonstration data
npx prisma db push
node scripts/seed.mjs

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. How to Test & Demo (Judge Walkthrough)

Collision Week includes an interactive **Persona Switcher** in the top navigation bar so judges can test all user stories without logging in:

1. **Role: Student (`Aldiansyah Fayruz`)**

   * Open the **16-Week Heat Map** (`/`). Observe Week 8 (Midterms) marked in crimson (`Cw = 4`).
   * Click on Week 8. View the 4 clashing major assignments.
   * Click **"Ask Sub-topic Peer Help"** on the Database project. Select `#3NF Normalization` and post an inquiry.
   * Open the **Peer Help Board** (`/help`). Filter by *"Needs Peer Help (>12h)"* to see prioritized urgent questions.
   * Click on a question, submit a peer response (Written, Screen recording link, or 20-min session), and click **"Mark as Resolved"**.
2. **Role: Lecturer (`Dr. Hendra Wijaya - Database Systems`)**

   * Open **Week Inspector** for Week 8 (`/weeks/8`).
   * Review the **Deterministic Minimal Date Move Engine**. Inspect the #1 ranked candidate proposing to shift the Database Midterm Project by $+1$ week to Week 9.
   * Click **"Approve & Shift Date"**. Observe the live recalculation: Week 8 collisions drop from $4 \rightarrow 3$, and the Heat Map updates instantly!
   * Open **Lecturer Analytics** (`/analytics`). Review which sub-topics triggered the highest student friction (e.g. `#3NF Normalization` with 6 inquiries and low resolution).
3. **Role: Program Coordinator / Admin (`Prof. Maya Arisanti`)**

   * Open **CSV Ingestion** (`/import`).
   * Validate and import department CSV schedules or click **"Reset to Demo Data"** to restore the initial state at any time.

---

## 7. Team & Attribution

**Team `daftar krna gratis` — GDGoC ITB STACK 2026**

* **Aldiansyah Fayruz** — Team Leader & Core Deterministic Logic
* **Khadijah Passa Alkhansa** — Frontend Engineer & UI/UX Designer
* **Khalisha Kaylanasywa** — Research, Data & Early User Testing
* **Shiti Azzahra Eka Rinaldi** — Product Manager, Proposal & Video Director

### AI Assistance Disclosure

In accordance with STACK 2026 guidelines, generative AI tools were utilized during code drafting and proofreading. **All core scheduling calculations, collision detection formulas, and minimal date move heuristics are 100% deterministic code without external LLM dependencies.**
