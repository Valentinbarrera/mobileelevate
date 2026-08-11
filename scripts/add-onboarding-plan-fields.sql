-- ============================================================================
-- AMPLIACIÓN: campos del onboarding que usa el generador de plan
-- ----------------------------------------------------------------------------
-- Ejecutar en el SQL Editor del dashboard de Supabase (proyecto
-- gssgoeaupfssexhliazy). Idempotente: se puede correr de nuevo sin romper nada.
--
-- CONTEXTO
-- El generador de plan (src/lib/planGenerator.ts) usa tres datos nuevos que el
-- cuestionario ahora pregunta:
--
--   • session_minutes    → minutos reales por sesión. Define cuántos ejercicios
--                          entran: es lo que evita prescribir 6 ejercicios a
--                          alguien que tiene 30 minutos.
--   • injury_severity     → 'molestia' | 'limita'. Decide si un ejercicio que
--                          carga la zona lesionada se REEMPLAZA o se SACA.
--   • avoided_exercises  → los que el alumno pidió no hacer (por gusto, no por
--                          lesión). Se sustituyen por otro del mismo patrón.
--
-- MIENTRAS NO SE CORRA
-- La app funciona igual: los tres campos viven en localStorage y el generador
-- los usa sin problema. Lo único que falta es que el COACH los vea desde
-- Elevate Web y que sobrevivan a un cambio de teléfono. Por eso `toRow()` en
-- src/lib/onboardingApi.ts todavía NO los envía: mandar una columna inexistente
-- haría fallar el upsert entero y se perdería también el resto del cuestionario.
--
-- DESPUÉS DE CORRERLO
-- Agregar estas tres líneas a `toRow()` en src/lib/onboardingApi.ts:
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

-- Solo los dos valores que entiende el generador (o vacío si no contestó).
ALTER TABLE public.athlete_onboarding
  DROP CONSTRAINT IF EXISTS athlete_onboarding_injury_severity_check;

ALTER TABLE public.athlete_onboarding
  ADD CONSTRAINT athlete_onboarding_injury_severity_check
  CHECK (injury_severity IS NULL OR injury_severity IN ('molestia', 'limita'));

-- Duración de sesión plausible: entre media hora y tres horas.
ALTER TABLE public.athlete_onboarding
  DROP CONSTRAINT IF EXISTS athlete_onboarding_session_minutes_check;

ALTER TABLE public.athlete_onboarding
  ADD CONSTRAINT athlete_onboarding_session_minutes_check
  CHECK (session_minutes IS NULL OR (session_minutes >= 15 AND session_minutes <= 180));

COMMENT ON COLUMN public.athlete_onboarding.session_minutes
  IS 'Minutos reales por sesión. El generador recorta ejercicios hasta entrar en este tiempo.';
COMMENT ON COLUMN public.athlete_onboarding.injury_severity
  IS 'molestia = buscar alternativa · limita = sacar el ejercicio si no hay alternativa segura.';
COMMENT ON COLUMN public.athlete_onboarding.avoided_exercises
  IS 'Ejercicios que el alumno pidió no hacer (preferencia, no lesión).';
