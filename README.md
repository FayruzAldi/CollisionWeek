# Collision Week: Academic Deadline Load Balancing and Sub-topic Peer Help

[![GDGoC ITB STACK 2026](https://img.shields.io/badge/Competition-GDGoC_ITB_STACK_2026-blue?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)
[![Case 1](https://img.shields.io/badge/Challenge-Case_1:_Smarter_Campus_&_Learning-emerald?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://collision-week.vercel.app/)
[![Deterministic Engine](https://img.shields.io/badge/Engine-100%25_Deterministic_(No_LLM)-rose?style=for-the-badge)](https://github.com/FayruzAldi/CollisionWeek)

> **Team:** `daftar krna gratis`
> **Target Phase:** Semifinal Submission (30 November 2026) & Final Day (16 December 2026)
> **Theme:** *"Agent of the Ocean: Vibing Beyond the Code"*
> **Live Deployment:** [https://collision-week.vercel.app/](https://collision-week.vercel.app/)
> **GitHub Repository:** [https://github.com/FayruzAldi/CollisionWeek.git](https://github.com/FayruzAldi/CollisionWeek.git)

---

## 1. Executive Summary & Problem Context

**Collision Week** is a responsive web application (with PWA support) powered by **pure deterministic calculations** that eliminates multi-course academic deadline clustering (*deadline collision*) across university study programs while pairing high-load crunch periods with structured, **sub-topic peer assistance** (*peer help*).

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

### Layer 1: Deterministic Load Balancing, Multi-Major Isolation & 16-Week Heat Map

* **Multi-Program Support (6 Jurusan):** Supports 6 participating study programs (`IF-2027` Teknik Informatika, `SI-2027` Sistem Informasi, `TE-2027` Teknik Elektro, `TI-2027` Teknik Industri, `MN-2027` Manajemen, `AK-2027` Akuntansi) with strict per-program calculation isolation and centralized Admin cross-program monitoring.
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
* **Student Shift Requests & Deterministic Minimal Date Move Algorithm:**
  When week $w$ is flagged ($C_w \ge 3$), students can submit date-shift proposals with reasons (`/api/shift-requests`), while the deterministic solver evaluates neighboring weeks within up to $\pm 3$ weeks prioritizing the nearest shifts (`-1, +1, +2, -2, +3, -3`). It keeps only moves where $C_{w'} < 3$ (ensuring no new collisions are created) and ranks them by smallest shift delta. **Course-ownership RBAC** ensures lecturers can only **Accept/Reject** shifts for courses they teach, recalculating live metrics immediately.
* **Drag-and-Drop CSV Ingestion:** Admins and lecturers can drag-and-drop CSV schedules (or load any of 6 downloadable per-program CSV templates), validate every row with Zod, track a 4-step import progress bar, and recalculate the 16-week heat map.

### Layer 2: Sub-topic Peer Assistance

* **Structured Sub-topic Tags:** Assignments feature granular sub-topic tags (e.g. `#3NF Normalization`, `#B-Tree Indexing`, `#IPv4 Subnetting`).
* **Whole-Class Visibility (Per Program):** Inquiries are posted to classmates within the same study program to overcome cold-start barriers.
* **Cold-Start Highlight:** Any question open for $> 12$ hours without a response is elevated with an urgent badge: `"Butuh bantuan (>12 jam)"`.
* **Three Inclusive Response Channels:**
  1. 📝 **Written Explanation:** Text & formatted walkthroughs for students who prefer reading.
  2. 🎥 **Short Recorded Link:** Screen recording or video link (Loom, Drive, YouTube).
  3. ⏱️ **20-Minute Micro-Session:** Propose a 20-minute discussion slot.
* **Resolution Loop:** Both requester and helper can mark inquiries as **Resolved**, driving KPI metrics (Time to First Response and Resolution Rate).

### Layer 3: Lecturer Sub-topic Analytics

* Aggregates inquiry density per sub-topic with interactive **Recharts** visualizations.
* Automatically flags high-friction topics (resolution rate $< 60\%$) with pedagogical recommendations for faculty review sessions.

---

## 3. Scope Management (Semifinal vs. Final Day)

Per STACK 2026 rules, teams must reserve **2–3 substantive development tasks** for the Final Day live build session.

| Capability                                       | Semifinal Phase (30 Nov 2026)                                                                                                                               | Final Day Milestone (16 Dec 2026)                                                               |
| :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Database & Synthetic Data**                    | **Complete:** Neon Serverless PostgreSQL schema with 1-semester synthetic dataset (16 weeks, 6 study programs, 20+ courses, 52 UMK demo accounts + avatars). | Extended multi-cohort cross-faculty datasets.                                                   |
| **Auth, RBAC & Cross-Program Admin**             | **Complete:** Passwordless `/login` with HMAC-SHA256 `httpOnly` cookies, strict 6-program isolation, lecturer course-ownership checks, Admin prodi switcher. | Institutional SSO integration.                                                                  |
| **Layer 1: CSV Ingestion & Load Engine**         | **Complete:** Drag-and-drop CSV upload, 6 program templates, Zod validation, 4-step progress bar, $C_w$ & $L_w$, 16-week Heat Map, Minimal Date Move solver. | Multi-scenario "what-if" simulations.                                                           |
| **Layer 1: PDF Syllabus & LMS Parser**           | **Transparent Mockup:** Labeled *"Segera"* / *"Planned for Final Day"* on `/about`.                                                                          | **Substantive Task #1:** PDF syllabus text extraction & Moodle API integration.                 |
| **Layer 2: Sub-topic Peer Help**                 | **Complete:** Inquiries, whole-class board, 3 response channels, resolution loop, student shift requests + reasons.                                         | Rich markdown editor & thread upvoting.                                                         |
| **Layer 2: 20-Min Session Auto-Scheduler**       | **Manual Scheduling:** Time slot picker with *"Planned for Final Day"* roadmap.                                                                              | **Substantive Task #2:** Automated Google Calendar / timetable conflict matcher.                |
| **Layer 3: Lecturer Analytics**                  | **Complete:** Recharts sub-topic density charts, KPI cards, & pedagogical friction alerts.                                                                   | **Substantive Task #3:** Automated PDF export of curriculum revision (RPS) reports.             |

---

## 4. Tech Stack

* **Framework:** Next.js 14 (App Router) + TypeScript
* **Styling, Charts & PWA:** Tailwind CSS 3.4, Lucide React, Recharts, PWA (`manifest.json` + `sw.js`)
* **Database & ORM:** **Neon Serverless PostgreSQL** (production on Vercel) + **Prisma ORM** (with optional SQLite schema for offline local dev)
* **Security & RBAC:** Server-side HMAC-SHA256 signed `httpOnly` session cookies (`cw_session`) + `src/middleware.ts` + `requireCapability()`
* **Validation & Parsing:** Zod (schema validation) + PapaParse (CSV processing)
* **Algorithms:** Pure deterministic mathematics (**0% AI / LLM** for scheduling and solver)

---

## 5. Getting Started & Local Setup

### Prerequisites

* Node.js v18+ or v20+
* npm (or pnpm)
* PostgreSQL database URL (e.g. Neon Serverless PostgreSQL)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/FayruzAldi/CollisionWeek.git
cd CollisionWeek

# 2. Configure environment variables
cp .env.example .env
# Fill DATABASE_URL, DATABASE_URL_UNPOOLED, and SESSION_SECRET (min. 16 chars)

# 3. Install dependencies & generate Prisma Client
npm install

# 4. Synchronize database schema & seed demonstration data
npx prisma db push
node scripts/seed.mjs

# 5. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or visit the live deployment at [https://collision-week.vercel.app/](https://collision-week.vercel.app/)).

---

## 6. How to Test & Demo (Judge Walkthrough)

Collision Week provides a passwordless **`/login`** screen backed by real server-side HMAC-SHA256 `httpOnly` cookies and 52 UMK demo accounts across 6 study programs so judges can test every role securely:

1. **Role: Student (e.g., `Ayu Pratama` — Teknik Informatika, or `Mira Wijaya` — Manajemen)**
   * Sign in via `/login` under the **Mahasiswa** tab.
   * Open **Peta Beban** (`/`). Observe critical weeks marked in crimson ($C_w \ge 3$) strictly scoped to the student's study program.
   * Open a critical week (e.g., `/weeks/10`). Submit a **date-shift request with a reason** to the lecturer (students cannot directly modify official schedules).
   * Click **"Minta bantuan sub-topik"** or open **Bantuan Sebaya** (`/help`), pick any assignment from the 16-week semester, select a sub-topic tag, and post an inquiry or submit a response (Written, Video Link, or 20-Min Session), then click **"Tandai selesai"**.
2. **Role: Lecturer (e.g., `Dr. Budi Hartono` or `Dr. Sari Anggraini`)**
   * Sign in via `/login` under the **Dosen** tab.
   * Open a critical week (`/weeks/10`). Review **Permintaan Geser dari Mahasiswa** (student names, avatars, and reasons) alongside the **Deterministic Minimal Date Move** recommendations.
   * Click **"Terapkan"** on a course owned by the logged-in lecturer and observe instant live recalculation (courses taught by other lecturers are locked with course-ownership enforcement).
   * Open **Analitik Dosen** (`/analytics`) to inspect Recharts sub-topic density charts, response KPIs, and review recommendations.
3. **Role: Program Coordinator / Admin (`Prof. Maya Arisanti`)**
   * Sign in via `/login` under the **Admin** tab (`maya.arisanti@umk.ac.id`).
   * Switch between all **6 study programs** from the dashboard header to verify separated per-program workload calculations.
   * Open **Impor Jadwal** (`/import`) to test drag-and-drop CSV upload, 6 downloadable per-program CSV templates, Zod validation, 4-step progress bar, or **"Atur ulang data"** to reset the demo dataset.

---

## 7. Team & Attribution

**Team `daftar krna gratis` — GDGoC ITB STACK 2026**

* **Aldiansyah Fayruz** (Universitas Muria Kudus) — Team Leader & Backend / Core Deterministic Logic
* **Khadijah Passa Alkhansa** (Telkom University Surabaya) — Frontend Engineer & UI/UX Designer
* **Khalisha Kaylanasywa** (Telkom University Surabaya) — User Research, Data & Validation
* **Shiti Azzahra Eka Rinaldi** (BINUS University) — Product Manager, Proposal Editor & Video Lead

### AI Assistance Disclosure

In accordance with STACK 2026 guidelines, generative AI tools were used transparently as assistants while the team remained responsible for all architecture, verification, and submitted deliverables:

* **Gemini / Antigravity:** Assisted with full-stack code scaffolding, TypeScript/Prisma refactoring, UI/UX polish, debugging, and editorial topic illustration generation.
* **ChatGPT (OpenAI) & Claude (Anthropic):** Assisted with proposal structuring, English proofreading, formatting checks, and consistency reviews based on team-supplied research and implementation data.
* **Zero AI in Core Logic:** **All core workload calculations ($L_w$, $C_w$), collision detection rules, and minimal date move solver heuristics are 100% deterministic code without any LLM/AI dependencies.**
