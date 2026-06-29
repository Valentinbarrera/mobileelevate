-- ============================================================================
-- Fix: permitir que los ALUMNOS registren su propio entrenamiento.
--
-- Síntoma: al tocar "Empezar entrenamiento" la app intenta crear una fila en
-- planned_sessions y Supabase responde 403 (Forbidden). Sin esa fila no se
-- puede crear el completed_session y el botón "no hace nada".
--
-- Causa: faltan políticas RLS de INSERT/UPDATE para el rol del alumno, y falta
-- la columna duration_seconds en completed_sessions.
--
-- Modelo de auth: la tabla `students` se vincula al usuario logueado por EMAIL
-- (students.email = auth.email()). Todas las políticas quedan acotadas a las
-- filas propias del alumno -> es seguro.
--
-- Idempotente: se puede correr varias veces sin romper nada.
-- ============================================================================

-- ── 1. Columna faltante en completed_sessions ───────────────────────────────
alter table public.completed_sessions
  add column if not exists duration_seconds integer;

-- ── 2. planned_sessions: el alumno puede crear/leer las suyas ────────────────
alter table public.planned_sessions enable row level security;

drop policy if exists "students_insert_own_planned_sessions" on public.planned_sessions;
create policy "students_insert_own_planned_sessions"
  on public.planned_sessions
  for insert to authenticated
  with check (
    student_id in (select id from public.students where email = auth.email())
  );

drop policy if exists "students_select_own_planned_sessions" on public.planned_sessions;
create policy "students_select_own_planned_sessions"
  on public.planned_sessions
  for select to authenticated
  using (
    student_id in (select id from public.students where email = auth.email())
  );

-- ── 3. completed_sessions: crear, leer y actualizar las propias ──────────────
alter table public.completed_sessions enable row level security;

drop policy if exists "students_insert_own_completed_sessions" on public.completed_sessions;
create policy "students_insert_own_completed_sessions"
  on public.completed_sessions
  for insert to authenticated
  with check (
    student_id in (select id from public.students where email = auth.email())
  );

drop policy if exists "students_select_own_completed_sessions" on public.completed_sessions;
create policy "students_select_own_completed_sessions"
  on public.completed_sessions
  for select to authenticated
  using (
    student_id in (select id from public.students where email = auth.email())
  );

drop policy if exists "students_update_own_completed_sessions" on public.completed_sessions;
create policy "students_update_own_completed_sessions"
  on public.completed_sessions
  for update to authenticated
  using (
    student_id in (select id from public.students where email = auth.email())
  )
  with check (
    student_id in (select id from public.students where email = auth.email())
  );

-- ── 4. completed_exercises: crear/leer las series de las sesiones propias ─────
alter table public.completed_exercises enable row level security;

drop policy if exists "students_insert_own_completed_exercises" on public.completed_exercises;
create policy "students_insert_own_completed_exercises"
  on public.completed_exercises
  for insert to authenticated
  with check (
    completed_session_id in (
      select cs.id
      from public.completed_sessions cs
      join public.students s on s.id = cs.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "students_select_own_completed_exercises" on public.completed_exercises;
create policy "students_select_own_completed_exercises"
  on public.completed_exercises
  for select to authenticated
  using (
    completed_session_id in (
      select cs.id
      from public.completed_sessions cs
      join public.students s on s.id = cs.student_id
      where s.email = auth.email()
    )
  );

-- ── 5. completed_exercises: EDITAR y BORRAR las series propias ────────────────
-- Necesario para "editar/borrar serie" en el entreno (modificar kg/reps, deshacer).
drop policy if exists "students_update_own_completed_exercises" on public.completed_exercises;
create policy "students_update_own_completed_exercises"
  on public.completed_exercises
  for update to authenticated
  using (
    completed_session_id in (
      select cs.id
      from public.completed_sessions cs
      join public.students s on s.id = cs.student_id
      where s.email = auth.email()
    )
  )
  with check (
    completed_session_id in (
      select cs.id
      from public.completed_sessions cs
      join public.students s on s.id = cs.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "students_delete_own_completed_exercises" on public.completed_exercises;
create policy "students_delete_own_completed_exercises"
  on public.completed_exercises
  for delete to authenticated
  using (
    completed_session_id in (
      select cs.id
      from public.completed_sessions cs
      join public.students s on s.id = cs.student_id
      where s.email = auth.email()
    )
  );
