-- ============================================================================
-- SETUP: Registro de comidas del alumno (athlete app) → sincronización a la nube
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la tabla `nutrition_log_entries`: UNA FILA POR ALIMENTO registrado por el
-- alumno (lo que comió, dentro o fuera del plan), con sus macros y la fecha.
-- Alimenta el historial de comidas + tendencia de macros, y lo deja visible para
-- el COACH. Hasta correr esto, la app sigue guardando todo en localStorage.
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================

-- ── 1. Tabla ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nutrition_log_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date        date NOT NULL,
  meal_type   text NOT NULL,                 -- desayuno | almuerzo | merienda | cena | snack
  name        text NOT NULL,
  calories    numeric NOT NULL DEFAULT 0,
  protein     numeric NOT NULL DEFAULT 0,
  carbs       numeric NOT NULL DEFAULT 0,
  fats        numeric NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_log_student_date
  ON public.nutrition_log_entries (student_id, date DESC);

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.nutrition_log_entries ENABLE ROW LEVEL SECURITY;

-- Alumno: lee su propio registro
DROP POLICY IF EXISTS "students_select_own_nutrition_log" ON public.nutrition_log_entries;
CREATE POLICY "students_select_own_nutrition_log" ON public.nutrition_log_entries
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: agrega comidas a su propio registro
DROP POLICY IF EXISTS "students_insert_own_nutrition_log" ON public.nutrition_log_entries;
CREATE POLICY "students_insert_own_nutrition_log" ON public.nutrition_log_entries
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: borra comidas de su propio registro
DROP POLICY IF EXISTS "students_delete_own_nutrition_log" ON public.nutrition_log_entries;
CREATE POLICY "students_delete_own_nutrition_log" ON public.nutrition_log_entries
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── 3. (COACH) Lectura del registro de sus alumnos ──────────────────────────
-- Asume que students.coach_id = auth.uid() del coach (mismo modelo que el resto).
DROP POLICY IF EXISTS "coach_select_students_nutrition_log" ON public.nutrition_log_entries;
CREATE POLICY "coach_select_students_nutrition_log" ON public.nutrition_log_entries
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));
-- ============================================================================
