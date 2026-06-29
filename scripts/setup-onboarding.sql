-- ============================================================================
-- SETUP: Cuestionario de intake / onboarding del alumno (athlete app)
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la tabla `athlete_onboarding` (una fila por alumno) con el contexto que
-- el COACH necesita para programar: datos corporales, experiencia, ejercicios
-- que domina, lesiones, objetivo, prioridades, equipamiento, actividad diaria,
-- datos nutricionales y la config del programa. SIN motor de calorías.
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================

-- ── 1. Tabla ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.athlete_onboarding (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  -- Datos corporales
  sex                  text,
  age                  integer,
  height_cm            numeric,
  weight_kg            numeric,
  -- Entrenamiento
  experience           text,
  mastered_exercises   text[] NOT NULL DEFAULT '{}',
  injury_areas         text[] NOT NULL DEFAULT '{}',
  injury_notes         text,
  -- Objetivo
  goal                 text,
  priorities           text[] NOT NULL DEFAULT '{}',
  -- Equipamiento + estilo de vida
  equipment            text[] NOT NULL DEFAULT '{}',
  activity_level       text,
  -- Nutrición (contexto, sin cálculo)
  meals_per_day        integer,
  dietary_restrictions text[] NOT NULL DEFAULT '{}',
  nutrition_notes      text,
  -- Programa
  training_mode        text,
  days_per_week        integer,
  split                text,
  program_weeks        integer,
  -- Meta
  completed_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id)
);

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.athlete_onboarding ENABLE ROW LEVEL SECURITY;

-- Alumno: lee su propio cuestionario
DROP POLICY IF EXISTS "students_select_own_onboarding" ON public.athlete_onboarding;
CREATE POLICY "students_select_own_onboarding" ON public.athlete_onboarding
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: crea su propio cuestionario
DROP POLICY IF EXISTS "students_insert_own_onboarding" ON public.athlete_onboarding;
CREATE POLICY "students_insert_own_onboarding" ON public.athlete_onboarding
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Alumno: edita su propio cuestionario
DROP POLICY IF EXISTS "students_update_own_onboarding" ON public.athlete_onboarding;
CREATE POLICY "students_update_own_onboarding" ON public.athlete_onboarding
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── 3. (COACH) Lectura del cuestionario de sus alumnos ──────────────────────
-- Asume que students.coach_id = auth.uid() del coach. Si tenés una tabla
-- `coaches` con otro mapeo, ajustá el predicado a tu modelo coach↔alumno.
DROP POLICY IF EXISTS "coach_select_students_onboarding" ON public.athlete_onboarding;
CREATE POLICY "coach_select_students_onboarding" ON public.athlete_onboarding
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- ── 4. updated_at automático (nombre único para no pisar funciones existentes) ─
CREATE OR REPLACE FUNCTION public.set_athlete_onboarding_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_athlete_onboarding_updated_at ON public.athlete_onboarding;
CREATE TRIGGER trg_athlete_onboarding_updated_at
  BEFORE UPDATE ON public.athlete_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_athlete_onboarding_updated_at();

-- ── 5. (Opcional) Espejar lo básico en `students` para la ficha del coach ────
-- El coach ya ve goal/level/age/height_cm/weight_kg/injuries en `students`.
-- Si querés que el alumno los actualice desde el cuestionario, necesita UPDATE
-- propio en `students`. Descomentá si lo querés:
--
-- DROP POLICY IF EXISTS "students_update_own_profile" ON public.students;
-- CREATE POLICY "students_update_own_profile" ON public.students
--   FOR UPDATE TO authenticated
--   USING (email = auth.email())
--   WITH CHECK (email = auth.email());
-- ============================================================================
