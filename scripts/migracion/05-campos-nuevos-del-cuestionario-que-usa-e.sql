-- ==========================================================================
-- BLOQUE 5 de 7 - Campos nuevos del cuestionario que usa el generador de plan
-- ==========================================================================
-- Parte de MIGRACION-COMPLETA-ASCII.sql, partida en pedazos para pegar de a
-- uno en el SQL Editor. Correr EN ORDEN, del 00 al 07. Cada bloque es
-- idempotente: si ya entro, volver a correrlo no rompe nada.
-- ==========================================================================

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
