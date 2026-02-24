# Architecture: Elevate Mobile

**Date:** 2026-02-24
**Architect:** Lucas Silva
**Project Level:** 3
**PRD:** docs/prd-elevate-mobile-2026-02-24.md

---

## Architectural Pattern

**Pattern:** Single-Page Application (React SPA) with BaaS

**Rationale:** Same architecture as Elevate Web. React SPA with Supabase as backend. No custom backend needed - Supabase provides auth, database, storage, and RLS.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + TypeScript | Same as web, shared knowledge |
| Bundler | Vite 5.4 | Fast dev, tree-shaking |
| Routing | React Router 6 | Already in codebase |
| State | TanStack React Query 5 | Server state caching |
| UI | Tailwind 3.4 + shadcn/ui | Already configured |
| Animations | Framer Motion | Already in codebase |
| Forms | React Hook Form + Zod | Already in codebase |
| Charts | Recharts | Progress visualization |
| Icons | Lucide React | Already in codebase |
| Backend | Supabase (BaaS) | Auth, DB, Storage, RLS |
| Database | PostgreSQL (via Supabase) | Same DB as Elevate Web |

---

## Key Architectural Decision: Single Supabase

**Current state:** App uses TWO Supabase projects:
1. `syrtcaagrrhdofekivjs` - Standalone fitness tracking (profiles, workouts, exercise_sets, etc.)
2. `fumuvimyitsnuweqrgap` - Coach project (routines, students, assignments)

**Target state:** ONE Supabase project:
- `gssgoeaupfssexhliazy` - Elevate Web's Supabase (same DB for coach + student)

**Migration strategy:**
1. Replace both Supabase clients with single client pointing to `gssgoeaupfssexhliazy`
2. Remove `useAuth.ts` (standalone auth) - use student auth directly
3. Remove `CoachAuthContext` - no dual-auth needed
4. Adapt all hooks to query Elevate Web tables
5. Delete standalone tables/migrations (profiles, workouts, exercise_sets, personal_records)

---

## Database Tables (from Elevate Web)

The mobile app reads/writes these existing tables:

### Auth
- `students` - Student profiles (full_name, email, coach_id, goal, level, age)

### Routines (read-only for student)
- `routines` - Routine templates
- `routine_days` - Days within routines
- `routine_exercises` - Exercises per day
- `routine_assignments` - Student-routine links (status: active/completed/paused)

### Sessions
- `planned_sessions` - Coach-planned sessions (date, routine_day_id, student_id)
- `completed_sessions` - Student-completed sessions (date, duration, notes)
- `completed_exercises` - Exercise data per completed session (name, sets, reps, weight)

### Progress
- `anthropometry` - Body measurements (weight_kg, waist_cm, hips_cm, body_fat, etc.)
- `progress_photos` - Photos linked to anthropometry records

### Communication
- `messages` - Coach-student messaging

### Exercise Library (read-only)
- `exercises` - Exercise definitions (name, muscle_group, equipment, video_url)

---

## Component Architecture

```
App.tsx
├── AuthProvider (Supabase session)
├── QueryClientProvider (TanStack Query)
├── BrowserRouter
│   ├── Public Routes
│   │   ├── /auth - Login
│   │   └── /reset-password - Password recovery
│   └── Protected Routes (require student auth)
│       ├── / - StudentDashboard
│       ├── /routines - RoutineList
│       ├── /routine/:id - RoutineDetail
│       ├── /workout/:sessionId - WorkoutExecution
│       ├── /workout-summary - PostWorkoutSummary
│       ├── /progress - ProgressDashboard
│       ├── /body-metrics - BodyMeasurements
│       ├── /messages - Messages
│       └── /profile - StudentProfile
└── BottomNav (persistent)
```

---

## Data Flow

```
Student (Mobile) → Supabase Auth → JWT Token
                 → Supabase DB (RLS: student_id = auth.uid())
                    ├── SELECT: routines, planned_sessions, anthropometry
                    ├── INSERT: completed_sessions, completed_exercises, messages
                    └── SELECT: messages (bidirectional)

Coach (Web) → Same Supabase
            ├── INSERT: routines, planned_sessions, anthropometry
            ├── SELECT: completed_sessions (see student progress)
            └── INSERT/SELECT: messages
```

---

## Auth Architecture

**Simplified from dual to single:**

```
Before (complex):
  useAuth → Main Supabase (standalone)
  useCoachAuth → Coach Supabase (routines)
  CoachAuthContext → Wraps dual auth

After (simple):
  useStudentAuth → Elevate Web Supabase
  - Login with student email/password
  - Fetch student profile from students table
  - JWT token for all queries
  - RLS handles data isolation
```

---

## Hooks Architecture (Target)

| Hook | Purpose | Tables |
|------|---------|--------|
| `useStudentAuth` | Auth + student profile | students |
| `useStudentDashboard` | Dashboard stats | routine_assignments, planned_sessions, completed_sessions |
| `useStudentRoutine` | Active routine detail | routine_assignments, routines, routine_days, routine_exercises |
| `useWorkoutSession` | Execute workout | completed_sessions, completed_exercises |
| `useStudentProgress` | Progress charts | anthropometry, completed_sessions, completed_exercises |
| `useStudentMessages` | Messaging | messages |
| `useUpcomingSessions` | Planned sessions | planned_sessions, routine_days |

**Note:** Many of these hooks already exist in Elevate Web (`useStudentApp.tsx`, `useMessages.tsx`). Logic can be ported directly.

---

## NFR Solutions

### NFR-001: Performance
- Lazy loading all routes (React.lazy + Suspense)
- TanStack Query with 5min staleTime
- Minimal bundle (remove unused deps)

### NFR-002: Mobile-First UX
- Touch targets ≥ 44px
- Bottom navigation (thumb zone)
- Dark theme default
- No horizontal scroll

### NFR-003: Security
- Supabase RLS policies (already configured from web)
- Auto token refresh
- Clean logout (clear all state)

### NFR-004: Compatibility
- Vite targets modern browsers
- No platform-specific APIs
- Progressive enhancement

### NFR-005: Clean Code
- Remove standalone Supabase
- Remove unused features (achievements, nutrition, check-ins, onboarding)
- Remove unused components

---

## Migration Checklist

1. **Replace Supabase config** → Point to `gssgoeaupfssexhliazy`
2. **Remove dual auth** → Single student auth
3. **Adapt hooks** → Query Elevate Web tables
4. **Remove standalone features** → Achievements, Nutrition, Check-ins, Onboarding
5. **Update routes** → Simplified navigation
6. **Update BottomNav** → Home, Rutinas, Progreso, Mensajes, Perfil
7. **Verify build** → Clean compilation
8. **Test data flow** → Queries match Elevate Web schema

---

**This architecture was created using BMAD Method v6 - Phase 3 (Solutioning)**
