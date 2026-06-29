-- ============================================================================
-- SETUP: Tracking diario del alumno (agua + bienestar) → sincronización a la nube
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la tabla `daily_tracking`: UNA FILA POR ALUMNO Y POR DÍA, con:
--   • water  → vasos de agua del día
--   • rpe / energy / sleep / note / workout_name → check-in de bienestar
--     (esfuerzo percibido, energía, sueño) que el alumno carga post-entreno.
-- Son datos de recuperación que el COACH usa para ajustar el plan.
-- Hasta correr esto, la app sigue guardando todo en localStorage.
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================

-- ── 1. Tabla ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_tracking (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date          date NOT NULL,
  water         integer NOT NULL DEFAULT 0,   -- vasos de agua
  rpe           integer,                      -- esfuerzo percibido 1-10
  energy        integer,                      -- energía 1-5
  sleep         integer,                      -- sueño 1-5
  note          text,
  workout_name  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tracking_student_date
  ON public.daily_tracking (student_id, date DESC);

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;

-- Alumno: lee lo suyo
DROP POLICY IF EXISTS "students_select_own_daily_tracking" ON public.daily_tracking;
CREATE POLICY "students_select_own_daily_tracking" ON public.daily_tracking
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: crea lo suyo
DROP POLICY IF EXISTS "students_insert_own_daily_tracking" ON public.daily_tracking;
CREATE POLICY "students_insert_own_daily_tracking" ON public.daily_tracking
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: edita lo suyo (upsert del día)
DROP POLICY IF EXISTS "students_update_own_daily_tracking" ON public.daily_tracking;
CREATE POLICY "students_update_own_daily_tracking" ON public.daily_tracking
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── 3. (COACH) Lectura del tracking de sus alumnos ──────────────────────────
DROP POLICY IF EXISTS "coach_select_students_daily_tracking" ON public.daily_tracking;
CREATE POLICY "coach_select_students_daily_tracking" ON public.daily_tracking
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- ── 4. updated_at automático (nombre único para no pisar funciones existentes) ─
CREATE OR REPLACE FUNCTION public.set_daily_tracking_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_tracking_updated_at ON public.daily_tracking;
CREATE TRIGGER trg_daily_tracking_updated_at
  BEFORE UPDATE ON public.daily_tracking
  FOR EACH ROW EXECUTE FUNCTION public.set_daily_tracking_updated_at();
-- ============================================================================
