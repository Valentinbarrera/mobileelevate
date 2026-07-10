-- ============================================================================
-- SETUP: Mediciones cargadas por el ALUMNO (athlete app)
-- ----------------------------------------------------------------------------
-- Ejecutar en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- IMPORTANTE: El INSERT de una medición NUEVA (una fecha que todavía no existe)
-- YA FUNCIONA sin correr esto — usa la misma policy de INSERT que las fotos de
-- progreso (`students_insert_own_anthropometry`).
--
-- Solo hace falta correr este script SI, al editar una medición de una fecha
-- QUE YA EXISTE, la app muestra el error de que "no se pudo actualizar la
-- medición de esa fecha". Eso significa que falta la policy de UPDATE del
-- alumno sobre `anthropometry`, que es lo que este script garantiza.
--
-- Es idempotente y defensivo (DROP POLICY IF EXISTS antes de crear).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================

ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;

-- ── SELECT: el alumno lee sus mediciones ────────────────────────────────────
DROP POLICY IF EXISTS "students_select_own_anthropometry" ON public.anthropometry;
CREATE POLICY "students_select_own_anthropometry" ON public.anthropometry
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── INSERT: el alumno crea una medición de una fecha nueva ──────────────────
DROP POLICY IF EXISTS "students_insert_own_anthropometry" ON public.anthropometry;
CREATE POLICY "students_insert_own_anthropometry" ON public.anthropometry
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── UPDATE: el alumno edita una medición de una fecha existente ─────────────
-- (Esta es la que suele faltar y provoca el error al re-guardar una fecha.)
DROP POLICY IF EXISTS "students_update_own_anthropometry" ON public.anthropometry;
CREATE POLICY "students_update_own_anthropometry" ON public.anthropometry
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Evita mediciones duplicadas de la misma fecha para un alumno (permite el
-- find-or-create sin condiciones de carrera).
CREATE UNIQUE INDEX IF NOT EXISTS anthropometry_student_date_uniq
  ON public.anthropometry (student_id, date);
-- ============================================================================
