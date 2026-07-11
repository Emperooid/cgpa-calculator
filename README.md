# GradePath — Student Academic Intelligence Platform

A crowd-powered CGPA calculator and academic planner for Nigerian university students. Students calculate their GPA, track their CGPA over time, predict what grades they need to reach a target class, and generate weekly study plans. The course database is built collaboratively — the first student from a department adds their courses, and every future student gets them auto-loaded.

**Live:** https://gradepath.vercel.app  
**Backend:** https://cgpa-calculator-backend-6ht2.onrender.com

---

## Features

- **No sign-up required** — a guest account is created silently on first visit; all data is immediately saved to that account
- **Account claiming** — add an email and password later from Settings to make the account recoverable from any device
- **GPA Calculator** — load your department's courses from the shared database, assign grades, and save semester records
- **CGPA Tracker** — running CGPA computed across all saved semesters with a trend line chart and grade distribution
- **CGPA Predictor** — enter your current standing and remaining units to get the exact GPA you need per semester; auto-fills from saved analytics
- **Study Plan Generator** — algorithmic weekly schedule built from your course load and CGPA gap to target
- **Grade History** — view all past semesters and delete any record; CGPA recalculates instantly on delete
- **Course Contribute** — add courses for your department so every future student from that department benefits
- **Settings** — edit name, level, and target classification; complete profile setup for guest accounts; claim account with email + password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 — `@import "tailwindcss"`, `@theme` tokens |
| Design System | Material You (Stitch) — full surface/outline/error token set |
| Icons | Material Symbols Outlined (variable font via Google Fonts) |
| State | Zustand with `persist` middleware (key: `cgpa-auth`) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod v4 |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Font | Geist Sans |

---

## Design System

Color tokens are defined in `src/app/globals.css` under `@theme`. All component files use token class names only — no hardcoded hex values.

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#3525cd` | Buttons, active nav, links |
| `--color-secondary` | `#006c49` | A-grade badges, success states |
| `--color-tertiary` | `#684000` | Tips, info banners |
| `--color-error` | `#ba1a1a` | F-grade badges, delete actions |
| `--color-background` | `#faf9ff` | Page background |
| `--color-surface` | `#faf9ff` | Input backgrounds |
| `--color-surface-container-lowest` | `#ffffff` | Card backgrounds |
| `--color-outline-variant` | `#c7c4d8` | Card borders, table dividers |

Icons are **Material Symbols Outlined** loaded as a variable font. The `FILL` axis controls filled vs. outline style:

```tsx
<span
  className="material-symbols-outlined text-primary"
  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
>
  dashboard
</span>
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx           # Redirects to /dashboard if token exists
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx   # Analytics, charts, getting started guide
│   │   ├── calculator/page.tsx  # Grade entry, course loading, auto-contribute
│   │   ├── predict/page.tsx     # CGPA predictor with analytics auto-fill
│   │   ├── plan/page.tsx        # Weekly study plan generator
│   │   ├── history/page.tsx     # Semester history with delete
│   │   ├── contribute/page.tsx  # Course database contributor
│   │   ├── settings/page.tsx    # Profile, account claim, guest setup
│   │   └── layout.tsx           # Multi-layer auth guard
│   ├── layout.tsx               # Root — GuestAuth wraps all children
│   └── page.tsx                 # Landing page
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx          # Desktop fixed sidebar + mobile slide-over
│   └── providers/
│       ├── GuestAuth.tsx        # Silent anonymous registration on first load
│       └── QueryProvider.tsx
├── services/                    # Axios wrappers for every backend endpoint
├── store/auth.store.ts          # Zustand auth store
├── lib/api.ts                   # Axios instance with 401 → refresh interceptor
└── types/index.ts               # Shared TypeScript interfaces and grade constants
```

---

## Authentication Flow

### Guest accounts (default path)

1. First visit — no token in localStorage
2. `GuestAuth` provider calls `POST /auth/anonymous`
3. Backend creates a user with placeholder email (`anon_<uuid>@gradepath.local`) and a random password the user never sees
4. Tokens stored as `cgpa_token` and `cgpa_refresh` in localStorage
5. User lands on the dashboard — fully functional with no form filled

Returning users with a token skip step 2–4 with no delay.

### Claiming an account

1. Guest user opens **Settings → Protect Your Data**
2. Enters email + password → `POST /auth/claim`
3. Backend updates the anonymous user's email and password; all existing grade history is preserved
4. User can now log in from any device using those credentials

### Traditional registration

`/register` is still available for users who prefer creating an account with email + password from the start. It collects name, email, password (step 1) and school, faculty, department, level (step 2).

### Token storage

| Key | Value | TTL |
|---|---|---|
| `cgpa_token` | Access JWT | 15 min |
| `cgpa_refresh` | Refresh JWT | 7 days |

The Axios interceptor in `src/lib/api.ts` catches 401 responses, calls `POST /auth/refresh`, stores the new tokens, and retries the original request automatically.

### Auth guards (dashboard layout)

Three layers prevent accessing the dashboard without a valid token:

| Layer | Trigger |
|---|---|
| `useEffect` with `usePathname()` dep | Every client-side route change |
| `popstate` listener | Browser back/forward button |
| `pageshow` listener | Browser bfcache restore |

All checks read `localStorage.getItem('cgpa_token')` directly rather than Zustand, which can hold stale state after a hard reload.

Logout uses `window.location.href = '/login'` (not `router.push`) to force a full page reload and clear Next.js Router Cache, preventing the back button from restoring the cached dashboard.

---

## Pages

### `/` — Landing Page
Marketing page with hero section and feature overview. "Go to Dashboard" button only renders when a token is present in localStorage.

### `/login` — Login
Email + password sign-in for returning users with a claimed account.

### `/register` — Register
2-step form. Step 1: name, email, password. Step 2: school search with inline "Add school" flow, faculty picker with inline "Add faculty" flow, department picker with inline "Add department" flow, level selector.

### `/dashboard` — Dashboard
**Empty state**: 3-step getting started guide — Contribute → Calculator → Track CGPA — each card links to the relevant page.  
**Filled state**: CGPA stat cards, GPA trend line chart (Recharts), grade distribution bar chart, graduation class chances with progress bars.

### `/calculator` — GPA Calculator
Loads courses from the database for the selected department, level, and semester. If no courses exist yet, shows a prompt linking to `/contribute`. Courses added manually are **auto-contributed to the database** when grades are submitted, so all grades (not just database-linked ones) are persisted. Live GPA preview updates as grades change.

### `/predict` — CGPA Predictor
Current CGPA and units completed pre-fill from saved analytics. Target grade preset buttons (First Class, 2:1, etc.) set the target CGPA automatically. Returns required GPA per remaining semester and the maximum achievable CGPA.

### `/plan` — Study Plan
Generates a day-by-day weekly schedule. Plan configuration: target classification, current semester, and focus courses (auto-loaded from the database). Saturday: past questions. Sunday: rest.

### `/history` — Grade History
Collapsible cards per semester showing all grades with color-coded badges (A = secondary-container, B = primary-container, C = tertiary-container, D/E = error-container, F = error). Delete button on each row opens a confirmation dialog; deletion removes the semester + all its grade records and immediately recalculates the CGPA.

### `/contribute` — Contribute Courses
4-step sequential flow: school → faculty → department → course entry form. Supports bulk entry (multiple rows). Submitted courses are marked `isVerified: true` and immediately appear in the calculator.

### `/settings` — Settings
**For guest users with no profile**: school/faculty/department/level picker to complete setup.  
**For users with a profile**: edit name, current level, and target classification.  
**For guest users**: "Protect Your Data" section to attach email + password.  
**For all users**: account info card showing email, school, and department.

---

## Environment Variables

```env
# Set in Vercel dashboard (required — build-time variable)
NEXT_PUBLIC_API_URL=https://cgpa-calculator-backend-6ht2.onrender.com/api
```

A fallback is also baked into `next.config.ts` so builds without the env var still point to the correct backend:

```typescript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ||
    'https://cgpa-calculator-backend-6ht2.onrender.com/api',
},
```

> After changing `NEXT_PUBLIC_API_URL` in Vercel, trigger a manual redeploy — it is a build-time variable and is not picked up at runtime.

---

## API Reference

All requests go to `NEXT_PUBLIC_API_URL`. Authenticated routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register with name, email, password, school, department, level |
| `POST` | `/auth/login` | No | Login — returns access + refresh tokens |
| `POST` | `/auth/anonymous` | No | Create a silent guest account |
| `POST` | `/auth/claim` | Yes | Attach email + password to a guest account |
| `POST` | `/auth/refresh` | No | Rotate access token using refresh token |
| `POST` | `/auth/logout` | Yes | Invalidate refresh token |
| `GET` | `/auth/me` | Yes | Get current user with full student profile |

### Schools / Faculties / Departments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/schools?search=` | No | Search schools by name |
| `POST` | `/schools` | No | Create a school |
| `GET` | `/faculties?schoolId=` | No | Get faculties for a school |
| `POST` | `/faculties` | No | Create a faculty |
| `GET` | `/departments?facultyId=` | No | Get departments for a faculty |
| `POST` | `/departments` | No | Create a department |

### Courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/courses?departmentId=&level=&semester=` | No | Get courses for a semester |
| `POST` | `/courses` | Yes | Add a single course |
| `POST` | `/courses/bulk` | Yes | Bulk-add courses for a semester |

### Students

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/students/profile` | Yes | Create student profile for a guest account |
| `GET` | `/students/profile` | Yes | Get full student profile |
| `PATCH` | `/students/profile` | Yes | Update name, level, or target |
| `GET` | `/students/history` | Yes | Get complete grade history by semester |

### GPA

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/gpa/submit-semester` | Yes | Submit grades and save semester record |
| `GET` | `/gpa/analytics` | Yes | CGPA, GPA trend, grade distribution |
| `DELETE` | `/gpa/semester/:id` | Yes | Delete a semester record and recompute CGPA |
| `POST` | `/gpa/predict/quick` | No | Stateless CGPA prediction (no account needed) |

### Study Plans

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/study-plans/generate` | Yes | Generate a weekly study plan |
| `GET` | `/study-plans/active` | Yes | Get the current active plan |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Wakeup ping — returns `{ status: "ok", ts: <epoch> }` |

---

## Grading System

Nigerian 5-point scale (default for all schools):

| Grade | Points | Class threshold |
|---|---|---|
| A | 5.0 | First Class ≥ 4.50 |
| B | 4.0 | Second Class Upper ≥ 3.50 |
| C | 3.0 | Second Class Lower ≥ 2.40 |
| D | 2.0 | Third Class ≥ 1.50 |
| E | 1.0 | Pass ≥ 1.00 |
| F | 0.0 | Fail |

**CGPA formula:**

```
CGPA = Σ(semester GPA × semester units) / Σ(all semester units)
```
