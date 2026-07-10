-- ============================================================================
-- Elevate — Índices de performance (idempotente)
-- ----------------------------------------------------------------------------
-- Correr UNA vez en el SQL Editor de Supabase (proyecto gssgoeaupfssexhliazy).
-- Postgres NO crea índices para foreign keys automáticamente, y la mayoría de
-- las tablas que consulta el alumno filtran por student_id / FKs sin índice.
-- El más importante es students(email): lo usa CADA policy RLS + el login.
--
-- CONCURRENTLY evita lockear las tablas en producción, pero NO puede correr
-- dentro de una transacción. Si el editor envuelve todo en una transacción y
-- falla, quitá "CONCURRENTLY" (las tablas son chicas hoy, el lock es breve).
-- ============================================================================

-- ── 0. CLAVE: students.email (usado por toda la RLS y el login) ─────────────
-- Verificá duplicados ANTES de crear el índice ÚNICO:
--   SELECT lower(email), count(*) FROM public.students GROUP BY 1 HAVING count(*) > 1;
-- Si hay duplicados, limpialos primero, o usá la variante NO única de abajo.
CREATE UNIQUE INDEX IF NOT EXISTS students_email_uniq ON public.students (lower(email));
-- Variante no-única (si hay duplicados y no querés limpiarlos aún):
-- CREATE INDEX IF NOT EXISTS students_email_idx ON public.students (lower(email));
CREATE INDEX IF NOT EXISTS students_coach_id_idx ON public.students (coach_id);

-- ── 1. Entrenamiento (core del alumno) ──────────────────────────────────────
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

-- ── 2. Nutrición ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS meal_plan_assignments_student_status_idx ON public.meal_plan_assignments (student_id, status);
CREATE INDEX IF NOT EXISTS meal_plan_assignments_meal_plan_id_idx   ON public.meal_plan_assignments (meal_plan_id);
CREATE INDEX IF NOT EXISTS meal_plan_days_plan_day_idx              ON public.meal_plan_days (meal_plan_id, day_number);
CREATE INDEX IF NOT EXISTS meals_day_order_idx                     ON public.meals (meal_plan_day_id, order_index);
CREATE INDEX IF NOT EXISTS meal_foods_meal_id_idx                  ON public.meal_foods (meal_id);
CREATE INDEX IF NOT EXISTS meal_foods_food_id_idx                  ON public.meal_foods (food_id);

-- ── 3. Progreso / fotos / mensajería ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS progress_photos_student_id_idx  ON public.progress_photos (student_id);
CREATE INDEX IF NOT EXISTS photo_comments_photo_created_idx ON public.photo_comments (photo_id, created_at);
CREATE INDEX IF NOT EXISTS photo_comments_coach_id_idx      ON public.photo_comments (coach_id);
CREATE INDEX IF NOT EXISTS messages_student_created_idx     ON public.messages (student_id, created_at);
CREATE INDEX IF NOT EXISTS messages_coach_id_idx            ON public.messages (coach_id);

-- ── 4. Tracking / videos / device tokens ────────────────────────────────────
CREATE INDEX IF NOT EXISTS hydration_logs_student_date_idx    ON public.hydration_logs (student_id, date);
CREATE INDEX IF NOT EXISTS athlete_wellness_student_date_idx  ON public.athlete_wellness (student_id, date);
CREATE INDEX IF NOT EXISTS exercise_videos_student_id_idx     ON public.exercise_videos (student_id);
CREATE INDEX IF NOT EXISTS exercise_videos_exercise_id_idx    ON public.exercise_videos (exercise_id);
CREATE INDEX IF NOT EXISTS video_corrections_video_id_idx     ON public.video_corrections (video_id);
CREATE INDEX IF NOT EXISTS device_tokens_email_idx            ON public.device_tokens (email);

-- ============================================================================
-- OPCIONAL (optimización fina de RLS) — no imprescindible si ya pusiste el
-- índice students(email). Cachea el student_id por statement en vez de correr
-- la subconsulta IN (...) por tabla. Luego reescribí las policies como
--   USING (student_id = public.current_student_id())
-- ----------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION public.current_student_id()
-- RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
-- AS $$ SELECT id FROM public.students WHERE lower(email) = lower((SELECT auth.email())) LIMIT 1 $$;
-- ============================================================================
