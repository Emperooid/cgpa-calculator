# GradePath — Student Academic Intelligence Platform

## Overview

GradePath is a web application that helps Nigerian university students calculate their GPA and CGPA, predict what grades they need to graduate at a target class, and generate a weekly study plan. The platform is crowd-powered: the first student from a school/department adds their courses, and every future student from that department gets them auto-loaded.

---

## Design System

- **Primary color**: Indigo (`#4f46e5`) — buttons, active nav, highlights
- **Success/selected state**: Emerald green (`#10b981`) — confirmations, achieved targets
- **Warning/tips**: Amber (`#f59e0b`) — study tips, alerts
- **Background**: Slate-50 (`#f8fafc`) — page background
- **Cards**: White with `border border-slate-100 shadow-sm rounded-xl`
- **Font**: Geist Sans
- **Border radius**: `rounded-xl` for cards, `rounded-lg` for inputs/buttons
- **Layout**: Sidebar navigation (fixed left, 256px wide) + scrollable main content area
- **Spacing**: Consistent `p-5` or `p-6` card padding, `space-y-6` between sections

---

## Application Structure

### Authentication Pages (`/login`, `/register`)

Centered layout, max-width 448px card, white background, no sidebar.

**Login Page (`/login`)**
- App logo (graduation cap icon) + "GradePath" title at top
- Heading: "Welcome back"
- Subtext: "Sign in to your GradePath account"
- Email input field
- Password input field
- "Sign In" button (full width, indigo)
- Link: "Don't have an account? Create one free" → `/register`

**Register Page (`/register`) — 2-step form**

Step 1 — Personal info:
- Progress bar (2 segments, indigo = completed)
- Full name input
- Email input
- Password input
- "Continue →" button (type=button, goes to step 2)

Step 2 — Academic info:
- **School search**: Text input with debounced search. Results appear as a clickable list below (white card, divide-y). If no results found, shows a dashed card: `"[typed name]" not found` + "Add school" button (indigo). After selection, shows green chip: ✓ University of Lagos [Change link]
- **Faculty**: Appears after school selected. Shows clickable list of existing faculties + text input + "Add" button for new ones. After selection shows green chip.
- **Department**: Appears after faculty selected. Shows dropdown of existing departments + text input + "Add" button. 
- **Current Level**: Dropdown — 100, 200, 300, 400, 500 Level
- **Matric Year**: Optional number input
- "← Back" + "Create Account" buttons side by side

---

### Dashboard Layout

Fixed left sidebar + scrollable right content area. Sidebar is white, `border-r border-slate-100`.

**Sidebar**
- Logo: graduation cap icon + "GradePath" in bold + subtitle "Academic Intelligence Platform"
- Navigation links (each with icon + label):
  - Dashboard (LayoutDashboard icon) → `/dashboard`
  - GPA Calculator (Calculator icon) → `/calculator`
  - CGPA Predictor (TrendingUp icon) → `/predict`
  - Study Plan (BookOpen icon) → `/plan`
  - Grade History (History icon) → `/history`
  - Add Courses (PlusCircle icon) → `/contribute`
- Active link: indigo background `bg-indigo-50`, indigo text, indigo icon
- Inactive links: slate-600 text, slate-400 icon, hover slate-50 bg
- Bottom section: User avatar (first letter of name, indigo bg), name + email, "Sign out" button (LogOut icon, red hover)

---

### Dashboard Page (`/dashboard`)

Greeting: "Good morning/afternoon/evening, [FirstName] 👋"
Subtext: "[School name] · [Department name] · [Level] Level"

**Empty state** (no grades yet):
- Indigo-tinted empty state card with BookOpen icon
- "No grades yet" heading + "Start by entering your semester grades" text
- "Enter Grades →" button → `/calculator`

**Filled state** (has grade data):

Stats grid (2 cols mobile, 4 cols desktop) — white cards, each with colored icon in rounded square:
1. **Current CGPA** — indigo icon, large number, grade class below (e.g. "Second Class Upper")
2. **Grade Class** — emerald icon, class abbreviation (e.g. "Second"), full class name below
3. **Units Completed** — amber icon, total credit units
4. **Strongest Course** — rose icon, course title (truncated)

**GPA Trend Chart** (shown if 2+ semesters): White card, line chart (Recharts LineChart), X-axis = semester labels like "100L S1", Y-axis 0–5, indigo line with dots

**Two-column row**:
- **Grade Distribution** bar chart — grades A/B/C/D/E/F on X-axis, count on Y-axis, indigo bars with rounded tops
- **Graduation Class Chances** — list of grade classes (First Class, 2:1, 2:2, Third, Pass) each with a progress bar. Achieved classes = emerald bar, not yet = indigo-300 bar

**Action buttons** row:
- "Predict My CGPA →" (indigo filled)
- "Generate Study Plan" (bordered)
- "Add New Semester" (bordered)

---

### GPA Calculator Page (`/calculator`)

**Semester selector card** — 3 columns: Level dropdown, Semester dropdown (First/Second), Academic Year number input

**Live GPA preview banner** — full width indigo gradient card showing:
- Left: "Live GPA Preview" label, large GPA number (e.g. 4.72), credit units count
- Right: grade class name (e.g. "First Class")

**Courses table** — white card with header "Courses [count]":
- Table columns: Code | Course Title | Units | Grade (dropdown A-E/F) | GP (calculated) | Delete button
- Courses auto-load from database when dept/level/semester is selected
- Each row has a grade select dropdown

**Add course manually** section (below table, grey bg):
- "Add course manually" label
- Row of inputs: course code (monospace, 96px wide) | title (flex-1) | units select | grade select | "Add" button

**Save button** — "Save & Calculate CGPA" (indigo, full width bottom)

**Success card** (after save) — emerald card: ✓ "Grades Saved Successfully", shows Semester GPA + Total Units in 2-col grid

---

### CGPA Predictor Page (`/predict`)

Heading: "CGPA Predictor"
Subtext: "Find out exactly what GPA you need each semester to hit your target."

**Input card** — 2x2 grid of number inputs:
1. Current CGPA (0–5.0)
2. Units Completed So Far
3. Target CGPA
4. Remaining Units

**Quick preset chips** below inputs — clickable pills for each grade class:
- First Class (4.5+) | 2:1 (3.5+) | 2:2 (2.4+) | Third (1.5+) | Pass (1.0+)
- Selected chip: indigo filled, others: bordered slate

**"Calculate What I Need" button** — full width, indigo, with Target icon

**Result card** (after calculation):
- If achievable: emerald border/bg, ✓ "Target is Achievable!" heading
- If not achievable: red border/bg, ⚠ "Target Not Achievable" heading
- Message text explaining requirement
- 2x2 stats grid (white inner cards): Current CGPA + class | Target CGPA + class | Required GPA (full-width indigo card if achievable) | Max Achievable CGPA

---

### Study Plan Page (`/plan`)

Heading: "Study Plan"

**Generator card** — white card:
- Target Class dropdown (First Class, 2:1, etc.)
- Current Semester dropdown
- Chip list showing courses for selected semester (code + units, small pill badges)
- "Generate My Study Plan" button with Zap icon

**Active plan banner** — full-width indigo card:
- Left: "Active Plan Target", grade name, CGPA target
- Right: hours/day with Clock icon, total weekly hours

**Tips card** — amber-50 background, BookOpen icon, "Tips for Success" heading, bullet list of tips

**Weekly schedule** — 2-column grid of day cards:
- Each day has its own color (Mon=blue, Tue=purple, Wed=emerald, Thu=amber, Fri=rose, Sat=indigo, Sun=slate)
- Shows list of tasks with → arrows

---

### Grade History Page (`/history`)

Heading: "Grade History"

**Collapsible semester cards** — each semester is a white card:
- Collapsed: left side has a square badge showing level (e.g. "100L"), semester name + year + units; right side shows GPA in large indigo text + chevron
- Expanded: full grade table with columns Code | Course | Units | Grade (colored badge: A=emerald, B=blue, C=amber, D=orange, F=red) | GP

---

### Contribute Page (`/contribute`)

Heading: "Contribute to the Database"
Info banner (indigo-50): Users icon + explanation that adding courses helps all students from the same department.

4-step sequential flow — each step is a white card that only shows after previous step is done:

**Step 1 — School**: Search input + results list + "Add" button if not found
**Step 2 — Faculty**: List of existing + text input + Add button. Shows after school selected.
**Step 3 — Department**: Same pattern. Shows after faculty selected.
**Step 4 — Add Courses**: Level selector + Semester selector + rows of course inputs (code | title | units | delete). "Add another course" link. "Submit [N] Course(s)" button.

---

## API Reference

Base URL: `http://localhost:3001/api`

All authenticated routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register with name, email, password, schoolId, departmentId, currentLevel |
| POST | `/auth/login` | No | Login, returns accessToken + refreshToken |
| POST | `/auth/refresh` | No | Refresh tokens |
| GET | `/auth/me` | Yes | Get current user with student profile |
| POST | `/auth/logout` | Yes | Logout |

### Schools / Faculties / Departments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/schools?search=` | No | Search schools by name |
| POST | `/schools` | No | Create new school |
| GET | `/faculties?schoolId=` | No | Get faculties for a school |
| POST | `/faculties` | No | Create faculty `{name, schoolId}` |
| GET | `/departments?facultyId=` | No | Get departments for a faculty |
| POST | `/departments` | No | Create department `{name, facultyId}` |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses?departmentId=&level=&semester=` | No | Get courses for a semester |
| POST | `/courses/bulk` | Yes | Bulk create courses `{departmentId, level, semester, courses[]}` |

### GPA
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/gpa/submit-semester` | Yes | Submit grades `{level, semester, year, grades[{courseId, grade}]}` |
| GET | `/gpa/analytics` | Yes | Get CGPA, trends, distribution |
| POST | `/gpa/predict/quick` | No | Quick prediction `{currentCgpa, totalUnitsDone, targetCgpa, remainingUnits}` |

### Students & Study Plans
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/students/history` | Yes | Grade history by semester |
| POST | `/study-plans/generate` | Yes | Generate plan `{targetGrade, targetCgpa, semesterCourses[]}` |
| GET | `/study-plans/active` | Yes | Get current active study plan |

---

## Grading System

Nigerian 5-point scale:
| Grade | Points | Class |
|-------|--------|-------|
| A | 5.0 | First Class ≥ 4.5 |
| B | 4.0 | Second Class Upper ≥ 3.5 |
| C | 3.0 | Second Class Lower ≥ 2.4 |
| D | 2.0 | Third Class ≥ 1.5 |
| E | 1.0 | Pass ≥ 1.0 |
| F | 0.0 | Fail |

CGPA = Σ(GPA × units per semester) / Σ(all units)

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, TanStack Query v5, React Hook Form, Zod v4, Recharts, lucide-react
- **Backend**: NestJS 11, TypeScript, Prisma v7, PostgreSQL (Neon), JWT auth (bcryptjs + passport-jwt)
- **Auth**: JWT stored in localStorage (`cgpa_token`, `cgpa_refresh`), auto-refresh on 401
