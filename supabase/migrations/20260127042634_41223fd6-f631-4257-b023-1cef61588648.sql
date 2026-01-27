-- =============================================
-- SISTEMA DE TRACKING DE EJERCICIOS INTELIGENTE
-- =============================================

-- Enum para dificultad percibida (RPE scale simplificada)
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'moderate', 'hard', 'max_effort');

-- =============================================
-- TABLA: exercises (catálogo de ejercicios)
-- =============================================
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  thumbnail TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLA: workouts (entrenamientos programados)
-- =============================================
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  intensity TEXT NOT NULL DEFAULT 'moderate',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLA: workout_exercises (ejercicios de un workout)
-- =============================================
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL DEFAULT 3,
  target_reps TEXT NOT NULL DEFAULT '10-12',
  target_weight DECIMAL(6,2),
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLA: workout_sessions (sesiones de entrenamiento del usuario)
-- =============================================
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER,
  notes TEXT,
  overall_difficulty difficulty_level,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLA: exercise_sets (sets reales completados por el usuario)
-- =============================================
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  is_pr BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABLA: personal_records (PRs por ejercicio)
-- =============================================
CREATE TABLE public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'max_weight', 'max_reps', 'max_volume'
  value DECIMAL(10,2) NOT NULL,
  weight DECIMAL(6,2),
  reps INTEGER,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exercise_set_id UUID REFERENCES public.exercise_sets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- =============================================
-- TABLA: exercise_history (historial resumido por ejercicio)
-- =============================================
CREATE TABLE public.exercise_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  max_weight DECIMAL(6,2) NOT NULL,
  total_reps INTEGER NOT NULL,
  total_volume DECIMAL(10,2) NOT NULL, -- weight * reps sumado
  avg_difficulty difficulty_level,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =============================================
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS
-- =============================================

-- Exercises: públicos para lectura
CREATE POLICY "Exercises are viewable by everyone" 
ON public.exercises FOR SELECT 
USING (true);

-- Workouts: públicos para lectura
CREATE POLICY "Workouts are viewable by everyone" 
ON public.workouts FOR SELECT 
USING (true);

-- Workout exercises: públicos para lectura
CREATE POLICY "Workout exercises are viewable by everyone" 
ON public.workout_exercises FOR SELECT 
USING (true);

-- Workout sessions: solo el usuario puede ver/crear/actualizar las suyas
CREATE POLICY "Users can view their own sessions" 
ON public.workout_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.workout_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.workout_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Exercise sets: solo el usuario puede CRUD los suyos (via session)
CREATE POLICY "Users can view their own exercise sets" 
ON public.exercise_sets FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE id = exercise_sets.session_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own exercise sets" 
ON public.exercise_sets FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE id = exercise_sets.session_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own exercise sets" 
ON public.exercise_sets FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE id = exercise_sets.session_id 
    AND user_id = auth.uid()
  )
);

-- Personal records: solo el usuario puede ver/crear/actualizar los suyos
CREATE POLICY "Users can view their own PRs" 
ON public.personal_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PRs" 
ON public.personal_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PRs" 
ON public.personal_records FOR UPDATE 
USING (auth.uid() = user_id);

-- Exercise history: solo el usuario puede ver/crear los suyos
CREATE POLICY "Users can view their own exercise history" 
ON public.exercise_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise history" 
ON public.exercise_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCIÓN: Actualizar PRs automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION public.check_and_update_pr()
RETURNS TRIGGER AS $$
DECLARE
  current_max_weight DECIMAL(6,2);
  current_max_reps INTEGER;
  current_max_volume DECIMAL(10,2);
  new_volume DECIMAL(10,2);
  session_user_id UUID;
BEGIN
  -- Obtener user_id de la sesión
  SELECT user_id INTO session_user_id 
  FROM public.workout_sessions 
  WHERE id = NEW.session_id;

  new_volume := NEW.weight * NEW.reps;

  -- Verificar PR de peso máximo
  SELECT value INTO current_max_weight 
  FROM public.personal_records 
  WHERE user_id = session_user_id 
    AND exercise_id = NEW.exercise_id 
    AND record_type = 'max_weight';

  IF current_max_weight IS NULL OR NEW.weight > current_max_weight THEN
    INSERT INTO public.personal_records (user_id, exercise_id, record_type, value, weight, reps, exercise_set_id)
    VALUES (session_user_id, NEW.exercise_id, 'max_weight', NEW.weight, NEW.weight, NEW.reps, NEW.id)
    ON CONFLICT (user_id, exercise_id, record_type) 
    DO UPDATE SET value = NEW.weight, weight = NEW.weight, reps = NEW.reps, exercise_set_id = NEW.id, achieved_at = now();
    
    NEW.is_pr := true;
  END IF;

  -- Verificar PR de reps máximas (con peso significativo)
  SELECT value INTO current_max_reps 
  FROM public.personal_records 
  WHERE user_id = session_user_id 
    AND exercise_id = NEW.exercise_id 
    AND record_type = 'max_reps';

  IF current_max_reps IS NULL OR NEW.reps > current_max_reps THEN
    INSERT INTO public.personal_records (user_id, exercise_id, record_type, value, weight, reps, exercise_set_id)
    VALUES (session_user_id, NEW.exercise_id, 'max_reps', NEW.reps, NEW.weight, NEW.reps, NEW.id)
    ON CONFLICT (user_id, exercise_id, record_type) 
    DO UPDATE SET value = NEW.reps, weight = NEW.weight, reps = NEW.reps, exercise_set_id = NEW.id, achieved_at = now();
    
    NEW.is_pr := true;
  END IF;

  -- Verificar PR de volumen máximo (peso * reps)
  SELECT value INTO current_max_volume 
  FROM public.personal_records 
  WHERE user_id = session_user_id 
    AND exercise_id = NEW.exercise_id 
    AND record_type = 'max_volume';

  IF current_max_volume IS NULL OR new_volume > current_max_volume THEN
    INSERT INTO public.personal_records (user_id, exercise_id, record_type, value, weight, reps, exercise_set_id)
    VALUES (session_user_id, NEW.exercise_id, 'max_volume', new_volume, NEW.weight, NEW.reps, NEW.id)
    ON CONFLICT (user_id, exercise_id, record_type) 
    DO UPDATE SET value = new_volume, weight = NEW.weight, reps = NEW.reps, exercise_set_id = NEW.id, achieved_at = now();
    
    NEW.is_pr := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para verificar PRs al insertar un set
CREATE TRIGGER check_pr_on_set_insert
BEFORE INSERT ON public.exercise_sets
FOR EACH ROW
EXECUTE FUNCTION public.check_and_update_pr();

-- =============================================
-- DATOS INICIALES: Ejercicios de ejemplo
-- =============================================
INSERT INTO public.exercises (name, muscle_group, equipment, thumbnail) VALUES
('Sentadilla con Barra', 'Piernas', 'Barra', '🏋️'),
('Press de Banca', 'Pecho', 'Barra', '💪'),
('Peso Muerto', 'Espalda', 'Barra', '🔥'),
('Dominadas', 'Espalda', 'Barra fija', '💪'),
('Press Militar', 'Hombros', 'Barra', '🏋️'),
('Curl de Bíceps', 'Brazos', 'Mancuernas', '💪'),
('Hip Thrust', 'Glúteos', 'Barra', '🍑'),
('Zancadas', 'Piernas', 'Mancuernas', '🦵'),
('Remo con Barra', 'Espalda', 'Barra', '💪'),
('Extensión de Tríceps', 'Brazos', 'Polea', '💪');

-- Workout de ejemplo
INSERT INTO public.workouts (id, title, description, duration_minutes, intensity, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Explosive Power', 'Entrenamiento de potencia explosiva para piernas y glúteos', 45, 'Alta', NULL);

-- Ejercicios del workout
INSERT INTO public.workout_exercises (workout_id, exercise_id, sets, target_reps, target_weight, rest_seconds, notes, order_index)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  id,
  4,
  '8-10',
  NULL,
  90,
  'Controla la bajada, explosivo en la subida',
  ROW_NUMBER() OVER (ORDER BY name) - 1
FROM public.exercises
LIMIT 5;