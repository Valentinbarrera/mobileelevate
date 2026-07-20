-- ============================================================================
-- SETUP: Sincronización a la nube de los datos "local-first" del alumno
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy). Se puede correr de nuevo sin romper nada
-- (todo es idempotente: CREATE IF NOT EXISTS + DROP POLICY IF EXISTS).
--
-- OJO: escrito TODO PLANO a propósito, sin bloques DO/DECLARE, porque el
-- "auto-RLS" del editor de Supabase los rompe (ya nos pasó con otros scripts).
--
-- Hasta ahora estos 5 datos vivían SOLO en localStorage del teléfono: se perdían
-- al reinstalar la app o al cambiar de dispositivo, y el COACH no podía verlos.
-- Este script crea sus tablas:
--
--   • readiness_entries → "¿cómo te sentís hoy?" pre-entreno (sueño/energía/
--     recuperación/estrés/motivación + vitalidad 0-100). 1 fila por alumno y día.
--   • exercise_feedback → estímulo muscular y dolor articular por ejercicio.
--   • my_programs       → programas que el alumno se armó (propios o de template).
--   • exercise_notes    → notas propias del alumno por ejercicio.
--   • body_log          → peso corporal que el alumno se registra (1 por día).
--
-- Mientras no se corra, la app sigue funcionando 100% en localStorage (las
-- llamadas remotas fallan suave y no rompen nada).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════════════
-- 1. TABLAS
-- ════════════════════════════════════════════════════════════════════════════

-- ── Readiness pre-sesión ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.readiness_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date        date NOT NULL,
  sleep       integer,   -- 1-5 (5 = dormí excelente)
  energy      integer,   -- 1-5 (5 = a full)
  recovery    integer,   -- 1-5 (5 = totalmente recuperado)
  stress      integer,   -- 1-5 (5 = cero estrés; más alto es mejor)
  motivation  integer,   -- 1-5 (5 = súper motivado)
  vitality    integer,   -- 0-100 (promedio normalizado, lo calcula la app)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_readiness_student_date
  ON public.readiness_entries (student_id, date DESC);

-- ── Feedback por ejercicio ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercise_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date          date NOT NULL,
  exercise_id   text NOT NULL,   -- id del ejercicio de la rutina (no siempre uuid)
  exercise_name text,
  stimulus      integer,         -- 1-5 estímulo muscular (5 = mucho)
  joint_pain    integer,         -- 1-5 dolor articular (1 = nada)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_feedback_student_date
  ON public.exercise_feedback (student_id, date DESC);

-- ── Programas propios del alumno ────────────────────────────────────────────
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
  days          jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{id,name,exercises:[...]}]
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_my_programs_student
  ON public.my_programs (student_id, created_at DESC);

-- ── Notas del alumno por ejercicio ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercise_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  text        text NOT NULL,
  pinned      boolean NOT NULL DEFAULT false,  -- fijada en todas las semanas
  date        date,                            -- última edición
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_notes_student
  ON public.exercise_notes (student_id);

-- ── Registro de peso corporal del alumno ────────────────────────────────────
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


-- ════════════════════════════════════════════════════════════════════════════
-- 2. RLS
--    Mismo criterio en las 5 tablas: el ALUMNO manda sobre lo suyo
--    (select/insert/update/delete) y el COACH puede LEER lo de sus alumnos.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.readiness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_programs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_log          ENABLE ROW LEVEL SECURITY;

-- ── readiness_entries ───────────────────────────────────────────────────────
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

-- ── exercise_feedback ───────────────────────────────────────────────────────
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

-- ── my_programs ─────────────────────────────────────────────────────────────
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

-- ── exercise_notes ──────────────────────────────────────────────────────────
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

-- ── body_log ────────────────────────────────────────────────────────────────
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


-- ════════════════════════════════════════════════════════════════════════════
-- 3. updated_at automático
-- ════════════════════════════════════════════════════════════════════════════

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
