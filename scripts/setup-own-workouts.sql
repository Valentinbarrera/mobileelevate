-- ============================================================================
-- SETUP: Entrenamientos PROPIOS del alumno (los que se arma él, sin coach)
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy). Se puede correr de nuevo sin romper nada
-- (todo es idempotente: CREATE IF NOT EXISTS + DROP POLICY IF EXISTS).
--
-- OJO: escrito TODO PLANO a propósito, sin bloques DO/DECLARE, porque el
-- "auto-RLS" del editor de Supabase los rompe (ya nos pasó con otros scripts).
--
-- ¿POR QUÉ TABLAS NUEVAS Y NO LAS DEL COACH?
-- Las tablas del plan del coach no sirven para esto:
--   • `completed_sessions` exige `planned_session_id` (una sesión planificada por
--     el coach), y en un entreno propio no existe tal cosa.
--   • `completed_exercises.routine_exercise_id` es FK a la rutina del coach, así
--     que tampoco se puede apuntar a un ejercicio de la biblioteca / inventado.
-- Por eso el entreno propio vive en su propio par de tablas:
--
--   • own_workout_sessions → una fila por entreno propio (fecha, programa,
--     día, notas, tonelaje total y duración).
--   • own_workout_sets     → una fila por SERIE cargada dentro de esa sesión.
--
-- Mientras no se corra este script, la app sigue funcionando 100% en modo local
-- (las llamadas remotas fallan suave y no rompen nada).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════════════
-- 1. TABLAS
-- ════════════════════════════════════════════════════════════════════════════

-- ── Sesión de entreno propio ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.own_workout_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date             date NOT NULL,
  program_id       text,      -- id del programa propio (myPrograms, no siempre uuid)
  program_name     text,      -- se guarda desnormalizado por si borra el programa
  day_name         text,      -- ej. "Día 1 · Empuje"
  notes            text,      -- lo que el alumno escribe al cerrar el entreno
  total_tonnage    numeric,   -- suma de weight*reps de sus series (lo calcula la app)
  duration_seconds integer,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_own_workout_sessions_student_date
  ON public.own_workout_sessions (student_id, date DESC);

-- ── Series cargadas dentro de una sesión propia ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.own_workout_sets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES public.own_workout_sessions(id) ON DELETE CASCADE,
  exercise_id   text,           -- id de la biblioteca si se enlazó; puede ser NULL
  exercise_name text NOT NULL,  -- siempre presente: es lo que se muestra
  series        integer NOT NULL,
  reps          integer,
  weight        numeric,
  tonnage       numeric,        -- weight * reps (NULL si da 0)
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_own_workout_sets_session
  ON public.own_workout_sets (session_id);


-- ════════════════════════════════════════════════════════════════════════════
-- 2. RLS
--    Mismo criterio que setup-athlete-sync.sql: el ALUMNO manda sobre lo suyo
--    (select/insert/update/delete) y el COACH puede LEER lo de sus alumnos.
--    En `own_workout_sets` no hay student_id: se resuelve por la sesión padre.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.own_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.own_workout_sets     ENABLE ROW LEVEL SECURITY;

-- ── own_workout_sessions ────────────────────────────────────────────────────
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

-- ── own_workout_sets ────────────────────────────────────────────────────────
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


-- ════════════════════════════════════════════════════════════════════════════
-- 3. updated_at automático
--    Solo en own_workout_sessions: las series se insertan/borran, no se "tocan"
--    lo suficiente como para justificar la columna.
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- PENDIENTE (a mano, fuera de este script):
--   Agregar el borrado de `own_workout_sessions` (y por CASCADE se van las
--   `own_workout_sets`) a la función `delete_my_account()`, para que al borrar
--   la cuenta no queden entrenos propios huérfanos.
-- ════════════════════════════════════════════════════════════════════════════
-- ============================================================================
