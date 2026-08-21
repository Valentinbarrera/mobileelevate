-- ############################################################################
-- ELEVATE - MIGRACION COMPLETA (17/08/2026)
-- ############################################################################
-- Pegar TODO esto en el SQL Editor de Supabase (proyecto gssgoeaupfssexhliazy)
-- y darle Run UNA sola vez. Es idempotente: si lo corres de nuevo no rompe nada.
--
-- El editor corre todo dentro de UNA transaccion: o entra todo, o no entra nada.
-- No hay estados a medias.
--
-- Verificado contra la base real antes de generarlo:
--   * Las 9 tablas del cuerpo NO existen hoy (device_tokens, del bloque 0,
--     puede existir ya: es idempotente).
--   * Las tablas y columnas que toca (indices, policies) SI existen.
--   * Ningun bloque DO/DECLARE (el auto-RLS del editor los rompe).
--
-- Que desbloquea:
--   * WEB DEL COACH  -> pestana "Desde la app" con datos reales + modulo
--                      Evaluaciones + ver las fotos que sube el alumno.
--   * APP DEL ALUMNO -> readiness / feedback / programas propios / notas / peso /
--                      entrenos propios / antropometria dejan de vivir solo en el
--                      telefono y sobreviven a un cambio de dispositivo.
-- ############################################################################


-- ############################################################################
-- 0/7 . device_tokens (push notifications)
-- fuente: scripts/setup-push-tokens.sql
-- ############################################################################
-- Va PRIMERO por una razon concreta: el bloque 7/7 le crea un indice a esta
-- tabla y delete_my_account() la referencia. Si no existiera, ese CREATE INDEX
-- falla y, como el editor corre todo en UNA transaccion, se cae la migracion
-- ENTERA. Con `create table if not exists` no rompe nada si ya estaba.

-- ============================================================================
-- SETUP: Tokens de dispositivo para push notifications
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- La app (src/lib/pushNotifications.ts) guarda aca el device token de cada
-- alumno. El backend del coach usa estos tokens para enviar avisos (nueva
-- rutina, feedback, mensaje) via APNs/FCM. Se vincula por EMAIL, igual que el
-- resto del modelo (los alumnos no tienen user_id).
-- ============================================================================

create table if not exists public.device_tokens (
  token      text primary key,
  email      text not null,
  platform   text,
  updated_at timestamptz not null default now()
);

alter table public.device_tokens enable row level security;

-- El alumno solo puede ver/gestionar SUS propios tokens (email = auth.email()).
drop policy if exists "device_tokens_select_own" on public.device_tokens;
create policy "device_tokens_select_own" on public.device_tokens
  for select to authenticated using (email = auth.email());

drop policy if exists "device_tokens_insert_own" on public.device_tokens;
create policy "device_tokens_insert_own" on public.device_tokens
  for insert to authenticated with check (email = auth.email());

drop policy if exists "device_tokens_update_own" on public.device_tokens;
create policy "device_tokens_update_own" on public.device_tokens
  for update to authenticated using (email = auth.email()) with check (email = auth.email());

drop policy if exists "device_tokens_delete_own" on public.device_tokens;
create policy "device_tokens_delete_own" on public.device_tokens
  for delete to authenticated using (email = auth.email());


-- ############################################################################
-- 1/7 . Datos local-first del alumno (readiness, feedback, programas propios, notas, peso)
-- fuente: scripts/setup-athlete-sync.sql
-- ############################################################################

-- ============================================================================
-- SETUP: Sincronizacion a la nube de los datos "local-first" del alumno
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy). Se puede correr de nuevo sin romper nada
-- (todo es idempotente: CREATE IF NOT EXISTS + DROP POLICY IF EXISTS).
--
-- OJO: escrito TODO PLANO a proposito, sin bloques DO/DECLARE, porque el
-- "auto-RLS" del editor de Supabase los rompe (ya nos paso con otros scripts).
--
-- Hasta ahora estos 5 datos vivian SOLO en localStorage del telefono: se perdian
-- al reinstalar la app o al cambiar de dispositivo, y el COACH no podia verlos.
-- Este script crea sus tablas:
--
--   * readiness_entries -> "como te sentis hoy?" pre-entreno (sueno/energia/
--     recuperacion/estres/motivacion + vitalidad 0-100). 1 fila por alumno y dia.
--   * exercise_feedback -> estimulo muscular y dolor articular por ejercicio.
--   * my_programs       -> programas que el alumno se armo (propios o de template).
--   * exercise_notes    -> notas propias del alumno por ejercicio.
--   * body_log          -> peso corporal que el alumno se registra (1 por dia).
--
-- Mientras no se corra, la app sigue funcionando 100% en localStorage (las
-- llamadas remotas fallan suave y no rompen nada).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================


-- 
-- 1. TABLAS
-- 

-- -- Readiness pre-sesion ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.readiness_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date        date NOT NULL,
  sleep       integer,   -- 1-5 (5 = dormi excelente)
  energy      integer,   -- 1-5 (5 = a full)
  recovery    integer,   -- 1-5 (5 = totalmente recuperado)
  stress      integer,   -- 1-5 (5 = cero estres; mas alto es mejor)
  motivation  integer,   -- 1-5 (5 = super motivado)
  vitality    integer,   -- 0-100 (promedio normalizado, lo calcula la app)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_readiness_student_date
  ON public.readiness_entries (student_id, date DESC);

-- -- Feedback por ejercicio --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date          date NOT NULL,
  exercise_id   text NOT NULL,   -- id del ejercicio de la rutina (no siempre uuid)
  exercise_name text,
  stimulus      integer,         -- 1-5 estimulo muscular (5 = mucho)
  joint_pain    integer,         -- 1-5 dolor articular (1 = nada)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_feedback_student_date
  ON public.exercise_feedback (student_id, date DESC);

-- -- Programas propios del alumno --------------------------------------------
-- El id lo genera el cliente (crypto.randomUUID) para que local y remoto usen
-- la MISMA clave y el upsert sea idempotente.
CREATE TABLE IF NOT EXISTS public.my_programs (
  id            uuid PRIMARY KEY,
  student_id    uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  level         text,
  weeks         integer,
  days_per_week integer,
  origin        text NOT NULL DEFAULT 'propio',  -- 'propio' | 'template'
  template_id   text,
  split_id      text,
  days          jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{id,name,week,exercises:[...]}]
  completed_at  timestamptz,                          -- lo dio por terminado (null = disponible)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Por si la tabla ya existia de una corrida anterior sin esta columna.
ALTER TABLE public.my_programs ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_my_programs_student
  ON public.my_programs (student_id, created_at DESC);

-- -- Notas del alumno por ejercicio ------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  text        text NOT NULL,
  pinned      boolean NOT NULL DEFAULT false,  -- fijada en todas las semanas
  date        date,                            -- ultima edicion
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_notes_student
  ON public.exercise_notes (student_id);

-- -- Registro de peso corporal del alumno ------------------------------------
CREATE TABLE IF NOT EXISTS public.body_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date       date NOT NULL,
  weight_kg  numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_body_log_student_date
  ON public.body_log (student_id, date DESC);


-- 
-- 2. RLS
--    Mismo criterio en las 5 tablas: el ALUMNO manda sobre lo suyo
--    (select/insert/update/delete) y el COACH puede LEER lo de sus alumnos.
-- 

ALTER TABLE public.readiness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_programs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_log          ENABLE ROW LEVEL SECURITY;

-- -- readiness_entries -------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_readiness" ON public.readiness_entries;
CREATE POLICY "students_select_own_readiness" ON public.readiness_entries
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_readiness" ON public.readiness_entries;
CREATE POLICY "students_insert_own_readiness" ON public.readiness_entries
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_readiness" ON public.readiness_entries;
CREATE POLICY "students_update_own_readiness" ON public.readiness_entries
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_readiness" ON public.readiness_entries;
CREATE POLICY "students_delete_own_readiness" ON public.readiness_entries
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_readiness" ON public.readiness_entries;
CREATE POLICY "coach_select_students_readiness" ON public.readiness_entries
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- exercise_feedback -------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_exfeedback" ON public.exercise_feedback;
CREATE POLICY "students_select_own_exfeedback" ON public.exercise_feedback
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_exfeedback" ON public.exercise_feedback;
CREATE POLICY "students_insert_own_exfeedback" ON public.exercise_feedback
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_exfeedback" ON public.exercise_feedback;
CREATE POLICY "students_update_own_exfeedback" ON public.exercise_feedback
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_exfeedback" ON public.exercise_feedback;
CREATE POLICY "students_delete_own_exfeedback" ON public.exercise_feedback
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_exfeedback" ON public.exercise_feedback;
CREATE POLICY "coach_select_students_exfeedback" ON public.exercise_feedback
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- my_programs -------------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_myprograms" ON public.my_programs;
CREATE POLICY "students_select_own_myprograms" ON public.my_programs
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_myprograms" ON public.my_programs;
CREATE POLICY "students_insert_own_myprograms" ON public.my_programs
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_myprograms" ON public.my_programs;
CREATE POLICY "students_update_own_myprograms" ON public.my_programs
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_myprograms" ON public.my_programs;
CREATE POLICY "students_delete_own_myprograms" ON public.my_programs
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_myprograms" ON public.my_programs;
CREATE POLICY "coach_select_students_myprograms" ON public.my_programs
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- exercise_notes ----------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_exnotes" ON public.exercise_notes;
CREATE POLICY "students_select_own_exnotes" ON public.exercise_notes
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_exnotes" ON public.exercise_notes;
CREATE POLICY "students_insert_own_exnotes" ON public.exercise_notes
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_exnotes" ON public.exercise_notes;
CREATE POLICY "students_update_own_exnotes" ON public.exercise_notes
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_exnotes" ON public.exercise_notes;
CREATE POLICY "students_delete_own_exnotes" ON public.exercise_notes
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_exnotes" ON public.exercise_notes;
CREATE POLICY "coach_select_students_exnotes" ON public.exercise_notes
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- body_log ----------------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_bodylog" ON public.body_log;
CREATE POLICY "students_select_own_bodylog" ON public.body_log
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_bodylog" ON public.body_log;
CREATE POLICY "students_insert_own_bodylog" ON public.body_log
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_bodylog" ON public.body_log;
CREATE POLICY "students_update_own_bodylog" ON public.body_log
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_bodylog" ON public.body_log;
CREATE POLICY "students_delete_own_bodylog" ON public.body_log
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_bodylog" ON public.body_log;
CREATE POLICY "coach_select_students_bodylog" ON public.body_log
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));


-- 
-- 3. updated_at automatico
-- 

CREATE OR REPLACE FUNCTION public.set_athlete_sync_updated_at()
RETURNS trigger AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_readiness_updated_at ON public.readiness_entries;
CREATE TRIGGER trg_readiness_updated_at
  BEFORE UPDATE ON public.readiness_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_sync_updated_at();

DROP TRIGGER IF EXISTS trg_exfeedback_updated_at ON public.exercise_feedback;
CREATE TRIGGER trg_exfeedback_updated_at
  BEFORE UPDATE ON public.exercise_feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_sync_updated_at();

DROP TRIGGER IF EXISTS trg_myprograms_updated_at ON public.my_programs;
CREATE TRIGGER trg_myprograms_updated_at
  BEFORE UPDATE ON public.my_programs
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_sync_updated_at();

DROP TRIGGER IF EXISTS trg_exnotes_updated_at ON public.exercise_notes;
CREATE TRIGGER trg_exnotes_updated_at
  BEFORE UPDATE ON public.exercise_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_sync_updated_at();

DROP TRIGGER IF EXISTS trg_bodylog_updated_at ON public.body_log;
CREATE TRIGGER trg_bodylog_updated_at
  BEFORE UPDATE ON public.body_log
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_sync_updated_at();
-- ============================================================================


-- ############################################################################
-- 2/7 . Entrenos propios del alumno (own_workout_sessions + own_workout_sets)
-- fuente: scripts/setup-own-workouts.sql
-- ############################################################################

-- ============================================================================
-- SETUP: Entrenamientos PROPIOS del alumno (los que se arma el, sin coach)
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy). Se puede correr de nuevo sin romper nada
-- (todo es idempotente: CREATE IF NOT EXISTS + DROP POLICY IF EXISTS).
--
-- OJO: escrito TODO PLANO a proposito, sin bloques DO/DECLARE, porque el
-- "auto-RLS" del editor de Supabase los rompe (ya nos paso con otros scripts).
--
-- POR QUE TABLAS NUEVAS Y NO LAS DEL COACH?
-- Las tablas del plan del coach no sirven para esto:
--   * `completed_sessions` exige `planned_session_id` (una sesion planificada por
--     el coach), y en un entreno propio no existe tal cosa.
--   * `completed_exercises.routine_exercise_id` es FK a la rutina del coach, asi
--     que tampoco se puede apuntar a un ejercicio de la biblioteca / inventado.
-- Por eso el entreno propio vive en su propio par de tablas:
--
--   * own_workout_sessions -> una fila por entreno propio (fecha, programa,
--     dia, notas, tonelaje total y duracion).
--   * own_workout_sets     -> una fila por SERIE cargada dentro de esa sesion.
--
-- Mientras no se corra este script, la app sigue funcionando 100% en modo local
-- (las llamadas remotas fallan suave y no rompen nada).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================


-- 
-- 1. TABLAS
-- 

-- -- Sesion de entreno propio ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.own_workout_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date             date NOT NULL,
  program_id       text,      -- id del programa propio (myPrograms, no siempre uuid)
  program_name     text,      -- se guarda desnormalizado por si borra el programa
  day_name         text,      -- ej. "Dia 1 . Empuje"
  notes            text,      -- lo que el alumno escribe al cerrar el entreno
  total_tonnage    numeric,   -- suma de weight*reps de sus series (lo calcula la app)
  duration_seconds integer,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_own_workout_sessions_student_date
  ON public.own_workout_sessions (student_id, date DESC);

-- -- Series cargadas dentro de una sesion propia -----------------------------
CREATE TABLE IF NOT EXISTS public.own_workout_sets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES public.own_workout_sessions(id) ON DELETE CASCADE,
  exercise_id   text,           -- id de la biblioteca si se enlazo; puede ser NULL
  exercise_name text NOT NULL,  -- siempre presente: es lo que se muestra
  series        integer NOT NULL,
  reps          integer,
  weight        numeric,
  tonnage       numeric,        -- weight * reps (NULL si da 0)
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_own_workout_sets_session
  ON public.own_workout_sets (session_id);


-- 
-- 2. RLS
--    Mismo criterio que setup-athlete-sync.sql: el ALUMNO manda sobre lo suyo
--    (select/insert/update/delete) y el COACH puede LEER lo de sus alumnos.
--    En `own_workout_sets` no hay student_id: se resuelve por la sesion padre.
-- 

ALTER TABLE public.own_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.own_workout_sets     ENABLE ROW LEVEL SECURITY;

-- -- own_workout_sessions ----------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_ownsessions" ON public.own_workout_sessions;
CREATE POLICY "students_select_own_ownsessions" ON public.own_workout_sessions
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_ownsessions" ON public.own_workout_sessions;
CREATE POLICY "students_insert_own_ownsessions" ON public.own_workout_sessions
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_ownsessions" ON public.own_workout_sessions;
CREATE POLICY "students_update_own_ownsessions" ON public.own_workout_sessions
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_ownsessions" ON public.own_workout_sessions;
CREATE POLICY "students_delete_own_ownsessions" ON public.own_workout_sessions
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "coach_select_students_ownsessions" ON public.own_workout_sessions;
CREATE POLICY "coach_select_students_ownsessions" ON public.own_workout_sessions
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- own_workout_sets --------------------------------------------------------
DROP POLICY IF EXISTS "students_select_own_ownsets" ON public.own_workout_sets;
CREATE POLICY "students_select_own_ownsets" ON public.own_workout_sets
  FOR SELECT TO authenticated
  USING (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())));

DROP POLICY IF EXISTS "students_insert_own_ownsets" ON public.own_workout_sets;
CREATE POLICY "students_insert_own_ownsets" ON public.own_workout_sets
  FOR INSERT TO authenticated
  WITH CHECK (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())));

DROP POLICY IF EXISTS "students_update_own_ownsets" ON public.own_workout_sets;
CREATE POLICY "students_update_own_ownsets" ON public.own_workout_sets
  FOR UPDATE TO authenticated
  USING (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())))
  WITH CHECK (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())));

DROP POLICY IF EXISTS "students_delete_own_ownsets" ON public.own_workout_sets;
CREATE POLICY "students_delete_own_ownsets" ON public.own_workout_sets
  FOR DELETE TO authenticated
  USING (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())));

DROP POLICY IF EXISTS "coach_select_students_ownsets" ON public.own_workout_sets;
CREATE POLICY "coach_select_students_ownsets" ON public.own_workout_sets
  FOR SELECT TO authenticated
  USING (session_id IN (SELECT id FROM public.own_workout_sessions WHERE student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid())));


-- 
-- 3. updated_at automatico
--    Solo en own_workout_sessions: las series se insertan/borran, no se "tocan"
--    lo suficiente como para justificar la columna.
-- 

CREATE OR REPLACE FUNCTION public.set_own_workouts_updated_at()
RETURNS trigger AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_own_workout_sessions_updated_at ON public.own_workout_sessions;
CREATE TRIGGER trg_own_workout_sessions_updated_at
  BEFORE UPDATE ON public.own_workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_own_workouts_updated_at();


-- 
-- PENDIENTE (a mano, fuera de este script):
--   Agregar el borrado de `own_workout_sessions` (y por CASCADE se van las
--   `own_workout_sets`) a la funcion `delete_my_account()`, para que al borrar
--   la cuenta no queden entrenos propios huerfanos.
-- 
-- ============================================================================


-- ############################################################################
-- 3/7 . Evaluaciones / antropometria (evaluations + anthropometry_measurements + bucket)
-- fuente: scripts/setup-evaluations.sql
-- ############################################################################

-- =====================================================
-- ANTROPOMETRIA - evaluaciones del alumno
-- =====================================================
-- Guarda el informe de antropometria completo (las ~50 variables del
-- fraccionamiento de 5 masas), que NO entra en la tabla vieja `anthropometry`
-- (solo tiene 7 columnas).
--
-- NO TOCA NINGUNA TABLA EXISTENTE: crea dos tablas nuevas. Respeta el freeze.
--
-- Se corre tal cual en el SQL Editor de Supabase. Es idempotente: se puede
-- correr varias veces. Escrito PLANO a proposito (sin bloques DO/DECLARE): el
-- auto-RLS del editor de Supabase rompe los bloques anonimos.
--
-- Es la MISMA estructura que usa el modulo Evaluaciones de la web del coach, asi
-- que lo que sube el alumno desde la app el coach lo ve desde la web, y al reves.
-- =====================================================


-- =====================================================
-- 1. EVALUATIONS (cabecera)
-- =====================================================
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  coach_id uuid references public.coaches(id) on delete set null,
  type text not null default 'anthropometry',
  measurement_date date not null default current_date,
  -- Objetivo que le fija el COACH a esta evaluacion (el alumno solo lo lee)
  goal text,
  goal_note text,
  notes text,
  -- De donde salio, para poder auditar la interpretacion
  source_file_name text,
  source_file_url text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_evaluations_student_type_date
  on public.evaluations(student_id, type, measurement_date);
create index if not exists idx_evaluations_student_id on public.evaluations(student_id);
create index if not exists idx_evaluations_coach_id on public.evaluations(coach_id);
create index if not exists idx_evaluations_date on public.evaluations(measurement_date desc);


-- =====================================================
-- 2. ANTHROPOMETRY_MEASUREMENTS (los valores)
-- =====================================================
-- Cada columna es el `id` de una variable en `src/types/evaluation.ts`.
create table if not exists public.anthropometry_measurements (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null unique references public.evaluations(id) on delete cascade,
  extra_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Las columnas van por separado con `add column if not exists` para que este
-- script sirva igual sobre una tabla creada por una version anterior.

-- Datos generales
alter table public.anthropometry_measurements add column if not exists weight numeric;
alter table public.anthropometry_measurements add column if not exists height numeric;
alter table public.anthropometry_measurements add column if not exists sitting_height numeric;
alter table public.anthropometry_measurements add column if not exists age numeric;
alter table public.anthropometry_measurements add column if not exists sex text;

-- Composicion corporal (kg)
alter table public.anthropometry_measurements add column if not exists muscle_mass numeric;
alter table public.anthropometry_measurements add column if not exists fat_mass numeric;
alter table public.anthropometry_measurements add column if not exists bone_mass numeric;
alter table public.anthropometry_measurements add column if not exists residual_mass numeric;
alter table public.anthropometry_measurements add column if not exists skin_mass numeric;
alter table public.anthropometry_measurements add column if not exists total_body_mass numeric;
alter table public.anthropometry_measurements add column if not exists body_fat_percentage numeric;
alter table public.anthropometry_measurements add column if not exists muscle_percentage numeric;

-- Indices
alter table public.anthropometry_measurements add column if not exists bmi numeric;
alter table public.anthropometry_measurements add column if not exists bone_mass_index numeric;
alter table public.anthropometry_measurements add column if not exists muscle_bone_index numeric;
alter table public.anthropometry_measurements add column if not exists adipose_muscle_index numeric;
alter table public.anthropometry_measurements add column if not exists waist_hip_ratio numeric;
alter table public.anthropometry_measurements add column if not exists projected_weight numeric;
alter table public.anthropometry_measurements add column if not exists basal_metabolism numeric;
alter table public.anthropometry_measurements add column if not exists energy_expenditure numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_endo numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_meso numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_ecto numeric;

-- Pliegues (mm)
alter table public.anthropometry_measurements add column if not exists triceps_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists subscapular_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists biceps_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists iliac_crest_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists supraspinale_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists abdominal_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists thigh_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists calf_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists sum_6_skinfolds numeric;
alter table public.anthropometry_measurements add column if not exists sum_8_skinfolds numeric;

-- Perimetros (cm)
alter table public.anthropometry_measurements add column if not exists relaxed_arm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists flexed_arm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists forearm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists head_circumference numeric;
alter table public.anthropometry_measurements add column if not exists waist_circumference numeric;
alter table public.anthropometry_measurements add column if not exists hip_circumference numeric;
alter table public.anthropometry_measurements add column if not exists thigh_circumference numeric;
alter table public.anthropometry_measurements add column if not exists upper_thigh_circumference numeric;
alter table public.anthropometry_measurements add column if not exists calf_circumference numeric;
alter table public.anthropometry_measurements add column if not exists chest_circumference numeric;

-- Diametros (cm)
alter table public.anthropometry_measurements add column if not exists humerus_breadth numeric;
alter table public.anthropometry_measurements add column if not exists femur_breadth numeric;
alter table public.anthropometry_measurements add column if not exists wrist_breadth numeric;
alter table public.anthropometry_measurements add column if not exists biacromial_breadth numeric;
alter table public.anthropometry_measurements add column if not exists biiliocristal_breadth numeric;
alter table public.anthropometry_measurements add column if not exists chest_transverse_breadth numeric;
alter table public.anthropometry_measurements add column if not exists chest_ap_breadth numeric;

create index if not exists idx_anthro_measurements_evaluation
  on public.anthropometry_measurements(evaluation_id);


-- =====================================================
-- 3. RLS
-- =====================================================
alter table public.evaluations enable row level security;
alter table public.anthropometry_measurements enable row level security;

-- --- El coach administra las de sus alumnos ---
drop policy if exists "Coaches manage their students evaluations" on public.evaluations;
create policy "Coaches manage their students evaluations"
  on public.evaluations
  for all
  using (student_id in (select id from public.students where coach_id = auth.uid()))
  with check (student_id in (select id from public.students where coach_id = auth.uid()));

-- --- El alumno LEE las suyas ---
-- Los alumnos se vinculan a auth por email, no por id.
drop policy if exists "Students read their own evaluations" on public.evaluations;
create policy "Students read their own evaluations"
  on public.evaluations
  for select
  using (student_id in (select id from public.students where email = auth.email()));

-- --- El alumno CARGA las suyas desde la app (subiendo el PDF) ---
drop policy if exists "Students insert their own evaluations" on public.evaluations;
create policy "Students insert their own evaluations"
  on public.evaluations
  for insert
  with check (student_id in (select id from public.students where email = auth.email()));

drop policy if exists "Students update their own evaluations" on public.evaluations;
create policy "Students update their own evaluations"
  on public.evaluations
  for update
  using (student_id in (select id from public.students where email = auth.email()))
  with check (student_id in (select id from public.students where email = auth.email()));

drop policy if exists "Students delete their own evaluations" on public.evaluations;
create policy "Students delete their own evaluations"
  on public.evaluations
  for delete
  using (student_id in (select id from public.students where email = auth.email()));

-- --- MEASUREMENTS: mismos permisos, via la evaluacion padre ---
drop policy if exists "Coaches manage their students measurements" on public.anthropometry_measurements;
create policy "Coaches manage their students measurements"
  on public.anthropometry_measurements
  for all
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.coach_id = auth.uid()
    )
  )
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.coach_id = auth.uid()
    )
  );

drop policy if exists "Students read their own measurements" on public.anthropometry_measurements;
create policy "Students read their own measurements"
  on public.anthropometry_measurements
  for select
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "Students insert their own measurements" on public.anthropometry_measurements;
create policy "Students insert their own measurements"
  on public.anthropometry_measurements
  for insert
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "Students update their own measurements" on public.anthropometry_measurements;
create policy "Students update their own measurements"
  on public.anthropometry_measurements
  for update
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  )
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );


-- =====================================================
-- 4. updated_at automatico
-- =====================================================
create or replace function public.set_evaluations_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

drop trigger if exists trg_evaluations_updated_at on public.evaluations;
create trigger trg_evaluations_updated_at
  before update on public.evaluations
  for each row execute function public.set_evaluations_updated_at();

drop trigger if exists trg_anthro_measurements_updated_at on public.anthropometry_measurements;
create trigger trg_anthro_measurements_updated_at
  before update on public.anthropometry_measurements
  for each row execute function public.set_evaluations_updated_at();


-- =====================================================
-- 5. STORAGE: bucket privado para los archivos originales
-- =====================================================
-- Lo usa la WEB del coach, que guarda el Excel que subio: la ruta es
-- {coach_id}/{student_id}/{archivo}. La app del alumno hoy NO sube el PDF
-- (solo guarda el nombre del archivo en `source_file_name`), pero el alumno
-- necesita poder LEER el archivo que subio su coach.
insert into storage.buckets (id, name, public)
values ('evaluations', 'evaluations', false)
on conflict (id) do nothing;

drop policy if exists "Coaches manage evaluation files" on storage.objects;
create policy "Coaches manage evaluation files"
  on storage.objects
  for all
  using (bucket_id = 'evaluations' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'evaluations' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Students read their evaluation files" on storage.objects;
create policy "Students read their evaluation files"
  on storage.objects
  for select
  using (
    bucket_id = 'evaluations'
    and (storage.foldername(name))[2] in (
      select id::text from public.students where email = auth.email()
    )
  );


-- ############################################################################
-- 4/7 . Permisos para que el coach vea las fotos de sus alumnos
-- fuente: scripts/setup-coach-reads-athlete-data.sql
-- ############################################################################

-- ============================================================================
-- Permisos de LECTURA del coach sobre lo que el alumno carga desde la app.
--
-- Contexto: las tablas nuevas (daily_tracking, nutrition_log_entries y las 5 de
-- athlete-sync) ya traen su policy de coach. Las de FOTOS no: `setup-progress-
-- photos.sql` dejo la parte del coach como TODO porque dependia de como el panel
-- resuelve auth.uid -> students. Este script cierra eso.
--
-- Sin esto, la ficha del alumno en la web del coach devuelve 0 filas de fotos y
-- las signed URLs fallan - no por un bug del frontend, sino por RLS.
--
-- Modelo: students.coach_id = auth.uid() del coach.
--         El alumno se vincula a auth por EMAIL (students no tiene user_id).
--
-- Idempotente. NO cambia schema: solo policies. Correr en el SQL Editor.
-- ============================================================================

-- -- 1. Filas de fotos y antropometria ---------------------------------------
DROP POLICY IF EXISTS "coach_select_students_photos" ON public.progress_photos;
CREATE POLICY "coach_select_students_photos" ON public.progress_photos
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

DROP POLICY IF EXISTS "coach_select_students_anthropometry" ON public.anthropometry;
CREATE POLICY "coach_select_students_anthropometry" ON public.anthropometry
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- -- 2. Comentarios del coach sobre las fotos --------------------------------
-- El alumno ya puede LEER los comentarios de sus fotos. Aca el coach los ve y
-- los escribe.
DROP POLICY IF EXISTS "coach_select_photo_comments" ON public.photo_comments;
CREATE POLICY "coach_select_photo_comments" ON public.photo_comments
  FOR SELECT TO authenticated
  USING (
    photo_id IN (
      SELECT p.id FROM public.progress_photos p
      WHERE p.student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "coach_insert_photo_comments" ON public.photo_comments;
CREATE POLICY "coach_insert_photo_comments" ON public.photo_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    photo_id IN (
      SELECT p.id FROM public.progress_photos p
      WHERE p.student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid())
    )
  );

-- -- 3. El archivo en el bucket privado --------------------------------------
-- La carpeta del bucket es el auth uid del ALUMNO, pero `students` se vincula a
-- auth por email, asi que hay que pasar por auth.users. Una policy no puede
-- leer auth.users directamente (el rol `authenticated` no tiene ese privilegio),
-- asi que se encapsula en una funcion SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.coach_owns_student_folder(folder text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $fn$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.students s ON s.email = u.email
    WHERE u.id::text = folder
      AND s.coach_id = auth.uid()
  );
$fn$;

REVOKE ALL ON FUNCTION public.coach_owns_student_folder(text) FROM public;
GRANT EXECUTE ON FUNCTION public.coach_owns_student_folder(text) TO authenticated;

DROP POLICY IF EXISTS "progress_photos_coach_select" ON storage.objects;
CREATE POLICY "progress_photos_coach_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND public.coach_owns_student_folder((storage.foldername(name))[1])
  );

-- -- 4. Verificacion ---------------------------------------------------------
-- Logueado como coach, esto deberia devolver las fotos de tus alumnos:
--   select p.id, p.photo_type, p.storage_path, a.date
--   from public.progress_photos p
--   join public.anthropometry a on a.id = p.anthropometry_id
--   order by a.date desc;


-- ############################################################################
-- 5/7 . Campos nuevos del cuestionario que usa el generador de plan
-- fuente: scripts/add-onboarding-plan-fields.sql
-- ############################################################################

-- ============================================================================
-- AMPLIACION: campos del onboarding que usa el generador de plan
-- ----------------------------------------------------------------------------
-- Ejecutar en el SQL Editor del dashboard de Supabase (proyecto
-- gssgoeaupfssexhliazy). Idempotente: se puede correr de nuevo sin romper nada.
--
-- CONTEXTO
-- El generador de plan (src/lib/planGenerator.ts) usa tres datos nuevos que el
-- cuestionario ahora pregunta:
--
--   * session_minutes    -> minutos reales por sesion. Define cuantos ejercicios
--                          entran: es lo que evita prescribir 6 ejercicios a
--                          alguien que tiene 30 minutos.
--   * injury_severity     -> 'molestia' | 'limita'. Decide si un ejercicio que
--                          carga la zona lesionada se REEMPLAZA o se SACA.
--   * avoided_exercises  -> los que el alumno pidio no hacer (por gusto, no por
--                          lesion). Se sustituyen por otro del mismo patron.
--
-- MIENTRAS NO SE CORRA
-- La app funciona igual: los tres campos viven en localStorage y el generador
-- los usa sin problema. Lo unico que falta es que el COACH los vea desde
-- Elevate Web y que sobrevivan a un cambio de telefono. Por eso `toRow()` en
-- src/lib/onboardingApi.ts todavia NO los envia: mandar una columna inexistente
-- haria fallar el upsert entero y se perderia tambien el resto del cuestionario.
--
-- DESPUES DE CORRERLO
-- Agregar estas tres lineas a `toRow()` en src/lib/onboardingApi.ts:
--     session_minutes:    d.sessionMinutes,
--     injury_severity:    d.injurySeverity,
--     avoided_exercises:  d.avoidedExercises,
-- y estas tres a `fromRow()`:
--     sessionMinutes:    num(r.session_minutes),
--     injurySeverity:    (r.injury_severity as OnboardingData["injurySeverity"]) ?? null,
--     avoidedExercises:  arr(r.avoided_exercises),
-- ============================================================================

ALTER TABLE public.athlete_onboarding
  ADD COLUMN IF NOT EXISTS session_minutes   integer,
  ADD COLUMN IF NOT EXISTS injury_severity   text,
  ADD COLUMN IF NOT EXISTS avoided_exercises text[] NOT NULL DEFAULT '{}';

-- Solo los dos valores que entiende el generador (o vacio si no contesto).
ALTER TABLE public.athlete_onboarding
  DROP CONSTRAINT IF EXISTS athlete_onboarding_injury_severity_check;

ALTER TABLE public.athlete_onboarding
  ADD CONSTRAINT athlete_onboarding_injury_severity_check
  CHECK (injury_severity IS NULL OR injury_severity IN ('molestia', 'limita'));

-- Duracion de sesion plausible: entre media hora y tres horas.
ALTER TABLE public.athlete_onboarding
  DROP CONSTRAINT IF EXISTS athlete_onboarding_session_minutes_check;

ALTER TABLE public.athlete_onboarding
  ADD CONSTRAINT athlete_onboarding_session_minutes_check
  CHECK (session_minutes IS NULL OR (session_minutes >= 15 AND session_minutes <= 180));

COMMENT ON COLUMN public.athlete_onboarding.session_minutes
  IS 'Minutos reales por sesion. El generador recorta ejercicios hasta entrar en este tiempo.';
COMMENT ON COLUMN public.athlete_onboarding.injury_severity
  IS 'molestia = buscar alternativa . limita = sacar el ejercicio si no hay alternativa segura.';
COMMENT ON COLUMN public.athlete_onboarding.avoided_exercises
  IS 'Ejercicios que el alumno pidio no hacer (preferencia, no lesion).';


-- ############################################################################
-- 6/7 . delete_my_account() actualizado (Apple 5.1.1v) - borra tambien lo nuevo
-- fuente: scripts/setup-account-deletion.sql
-- ############################################################################

-- ============================================================================
-- SETUP: Borrar cuenta desde la app (requisito App Store 5.1.1(v))
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la funcion `public.delete_my_account()` que el ALUMNO puede llamar para
-- eliminar SU cuenta y TODOS sus datos personales. SECURITY DEFINER pero solo
-- borra lo del usuario autenticado (auth.uid / auth.email). Los alumnos se
-- vinculan por EMAIL -> student_id IN (SELECT id FROM students WHERE email=...).
--
-- Nota: inline el subquery de email (sin variable) y delimitador $func$ para
-- que el "auto-RLS" del editor de Supabase no lo modifique.
-- ============================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  -- -- Datos personales del alumno ------------------------------------------
  -- Cada borrado en su propio bloque: si una tabla/columna no existe o una FK
  -- bloquea, se ignora y sigue (la funcion nunca se corta a la mitad).
  -- completed_exercises se referencia por completed_session_id (NO tiene student_id).
  -- Hay que borrarlas ANTES que completed_sessions (su padre).
  begin delete from public.completed_exercises where completed_session_id in (select id from public.completed_sessions where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.completed_sessions   where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.planned_sessions     where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.photo_comments where photo_id in (select id from public.progress_photos where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.progress_photos      where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.anthropometry        where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.athlete_onboarding   where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.nutrition_log_entries where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.daily_tracking       where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.messages             where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.routine_assignments  where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.meal_plan_assignments where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.device_tokens where email = auth.email(); exception when others then null; end;
  -- Datos sincronizados desde el telefono (scripts/setup-athlete-sync.sql).
  -- Tienen ON DELETE CASCADE, pero los borramos explicito para no depender de eso.
  begin delete from public.readiness_entries where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.exercise_feedback where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.my_programs       where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.exercise_notes    where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.body_log          where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  -- Entrenos de programas propios (scripts/setup-own-workouts.sql). Las series
  -- van primero: cuelgan de la sesion.
  begin delete from public.own_workout_sets where session_id in (select id from public.own_workout_sessions where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.own_workout_sessions where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  -- Evaluaciones de antropometria (scripts/setup-evaluations.sql). Las mediciones
  -- cuelgan de la evaluacion, asi que van primero.
  begin delete from public.anthropometry_measurements where evaluation_id in (select id from public.evaluations where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.evaluations where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.students where email = auth.email(); exception when others then null; end;

  -- -- Archivos del storage (buckets privados) ------------------------------
  -- Fotos de progreso: la carpeta es el uid del alumno.
  begin delete from storage.objects where bucket_id = 'progress-photos' and owner = auth.uid(); exception when others then null; end;
  -- Informes de antropometria: los sube el alumno (owner) o el coach.
  begin delete from storage.objects where bucket_id = 'evaluations' and owner = auth.uid(); exception when others then null; end;

  -- -- El usuario de auth (login + identidades + sesiones) ------------------
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;


-- ############################################################################
-- 7/7 . Indices de performance
-- fuente: scripts/optimize-indexes.sql
-- ############################################################################

-- ============================================================================
-- Elevate - Indices de performance (idempotente)
-- ----------------------------------------------------------------------------
-- Correr UNA vez en el SQL Editor de Supabase (proyecto gssgoeaupfssexhliazy).
-- Postgres NO crea indices para foreign keys automaticamente, y la mayoria de
-- las tablas que consulta el alumno filtran por student_id / FKs sin indice.
-- El mas importante es students(email): lo usa CADA policy RLS + el login.
--
-- CONCURRENTLY evita lockear las tablas en produccion, pero NO puede correr
-- dentro de una transaccion. Si el editor envuelve todo en una transaccion y
-- falla, quita "CONCURRENTLY" (las tablas son chicas hoy, el lock es breve).
-- ============================================================================

-- -- 0. CLAVE: students.email (usado por toda la RLS y el login) -------------
-- Verifica duplicados ANTES de crear el indice UNICO:
--   SELECT lower(email), count(*) FROM public.students GROUP BY 1 HAVING count(*) > 1;
-- Si hay duplicados, limpialos primero, o usa la variante NO unica de abajo.
CREATE UNIQUE INDEX IF NOT EXISTS students_email_uniq ON public.students (lower(email));
-- Variante no-unica (si hay duplicados y no queres limpiarlos aun):
-- CREATE INDEX IF NOT EXISTS students_email_idx ON public.students (lower(email));
CREATE INDEX IF NOT EXISTS students_coach_id_idx ON public.students (coach_id);

-- -- 1. Entrenamiento (core del alumno) --------------------------------------
CREATE INDEX IF NOT EXISTS routine_assignments_student_status_idx ON public.routine_assignments (student_id, status);
CREATE INDEX IF NOT EXISTS routine_assignments_routine_id_idx     ON public.routine_assignments (routine_id);
CREATE INDEX IF NOT EXISTS planned_sessions_student_day_date_idx  ON public.planned_sessions (student_id, routine_day_id, date);
CREATE INDEX IF NOT EXISTS planned_sessions_assignment_id_idx     ON public.planned_sessions (assignment_id);
CREATE INDEX IF NOT EXISTS planned_sessions_routine_day_id_idx    ON public.planned_sessions (routine_day_id);
CREATE INDEX IF NOT EXISTS completed_sessions_student_date_idx    ON public.completed_sessions (student_id, date DESC);
CREATE INDEX IF NOT EXISTS completed_sessions_planned_session_idx ON public.completed_sessions (planned_session_id);
CREATE INDEX IF NOT EXISTS completed_exercises_session_ex_idx     ON public.completed_exercises (completed_session_id, routine_exercise_id);
CREATE INDEX IF NOT EXISTS completed_exercises_routine_ex_idx     ON public.completed_exercises (routine_exercise_id);
CREATE INDEX IF NOT EXISTS routine_days_routine_order_idx         ON public.routine_days (routine_id, order_index);
CREATE INDEX IF NOT EXISTS routine_exercises_day_order_idx        ON public.routine_exercises (routine_day_id, order_index);
CREATE INDEX IF NOT EXISTS routine_exercises_exercise_id_idx      ON public.routine_exercises (exercise_id);
CREATE INDEX IF NOT EXISTS exercises_coach_id_idx                 ON public.exercises (coach_id);

-- -- 2. Nutricion ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS meal_plan_assignments_student_status_idx ON public.meal_plan_assignments (student_id, status);
CREATE INDEX IF NOT EXISTS meal_plan_assignments_meal_plan_id_idx   ON public.meal_plan_assignments (meal_plan_id);
CREATE INDEX IF NOT EXISTS meal_plan_days_plan_day_idx              ON public.meal_plan_days (meal_plan_id, day_number);
CREATE INDEX IF NOT EXISTS meals_day_order_idx                     ON public.meals (meal_plan_day_id, order_index);
CREATE INDEX IF NOT EXISTS meal_foods_meal_id_idx                  ON public.meal_foods (meal_id);
CREATE INDEX IF NOT EXISTS meal_foods_food_id_idx                  ON public.meal_foods (food_id);

-- -- 3. Progreso / fotos / mensajeria ----------------------------------------
CREATE INDEX IF NOT EXISTS progress_photos_student_id_idx  ON public.progress_photos (student_id);
CREATE INDEX IF NOT EXISTS photo_comments_photo_created_idx ON public.photo_comments (photo_id, created_at);
CREATE INDEX IF NOT EXISTS photo_comments_coach_id_idx      ON public.photo_comments (coach_id);
CREATE INDEX IF NOT EXISTS messages_student_created_idx     ON public.messages (student_id, created_at);
CREATE INDEX IF NOT EXISTS messages_coach_id_idx            ON public.messages (coach_id);

-- -- 4. Tracking / videos / device tokens ------------------------------------
CREATE INDEX IF NOT EXISTS hydration_logs_student_date_idx    ON public.hydration_logs (student_id, date);
CREATE INDEX IF NOT EXISTS athlete_wellness_student_date_idx  ON public.athlete_wellness (student_id, date);
CREATE INDEX IF NOT EXISTS exercise_videos_student_id_idx     ON public.exercise_videos (student_id);
CREATE INDEX IF NOT EXISTS exercise_videos_exercise_id_idx    ON public.exercise_videos (exercise_id);
CREATE INDEX IF NOT EXISTS video_corrections_video_id_idx     ON public.video_corrections (video_id);
CREATE INDEX IF NOT EXISTS device_tokens_email_idx            ON public.device_tokens (email);

-- ============================================================================
-- OPCIONAL (optimizacion fina de RLS) - no imprescindible si ya pusiste el
-- indice students(email). Cachea el student_id por statement en vez de correr
-- la subconsulta IN (...) por tabla. Luego reescribi las policies como
--   USING (student_id = public.current_student_id())
-- ----------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION public.current_student_id()
-- RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
-- AS $$ SELECT id FROM public.students WHERE lower(email) = lower((SELECT auth.email())) LIMIT 1 $$;
-- ============================================================================

-- ############################################################################
-- LISTO. Para comprobar que entro todo, corre esto: tienen que salir 9 filas.
-- ############################################################################
-- select table_name from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('readiness_entries','exercise_feedback','my_programs',
--                      'exercise_notes','body_log','own_workout_sessions',
--                      'own_workout_sets','evaluations','anthropometry_measurements')
-- order by table_name;
