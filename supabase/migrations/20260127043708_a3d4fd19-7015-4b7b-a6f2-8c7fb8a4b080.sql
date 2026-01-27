-- =============================================
-- SISTEMA DE CHECK-INS SEMANALES
-- =============================================

-- Enum para niveles de energía
CREATE TYPE public.energy_level AS ENUM ('very_low', 'low', 'moderate', 'high', 'very_high');

-- Enum para adherencia
CREATE TYPE public.adherence_level AS ENUM ('poor', 'fair', 'good', 'excellent');

-- =============================================
-- TABLA: weekly_checkins (check-ins semanales del alumno)
-- =============================================
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  
  -- Métricas físicas
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,1),
  
  -- Fotos de progreso
  front_photo_url TEXT,
  side_photo_url TEXT,
  back_photo_url TEXT,
  
  -- Estado subjetivo
  energy_level energy_level NOT NULL DEFAULT 'moderate',
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  soreness_level INTEGER CHECK (soreness_level >= 1 AND soreness_level <= 5),
  
  -- Adherencia
  training_adherence adherence_level NOT NULL DEFAULT 'good',
  nutrition_adherence adherence_level NOT NULL DEFAULT 'good',
  workouts_completed INTEGER NOT NULL DEFAULT 0,
  workouts_planned INTEGER NOT NULL DEFAULT 0,
  
  -- Notas del alumno
  wins TEXT, -- Logros de la semana
  challenges TEXT, -- Desafíos enfrentados
  notes TEXT, -- Notas adicionales
  
  -- Metadatos
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Un check-in por semana por usuario
  UNIQUE(user_id, week_number, year)
);

-- =============================================
-- TABLA: coach_feedback (feedback del coach sobre check-ins)
-- =============================================
CREATE TABLE public.coach_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id UUID NOT NULL REFERENCES public.weekly_checkins(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL, -- ID del coach (para futuro sistema de roles)
  
  -- Feedback
  message TEXT NOT NULL,
  
  -- Ajustes sugeridos
  training_adjustment TEXT,
  nutrition_adjustment TEXT,
  
  -- Rating del progreso
  progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 5),
  
  -- Badges/reconocimientos
  badges TEXT[], -- Array de badges otorgados
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- HABILITAR RLS
-- =============================================
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_feedback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS - weekly_checkins
-- =============================================
CREATE POLICY "Users can view their own checkins" 
ON public.weekly_checkins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
ON public.weekly_checkins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins" 
ON public.weekly_checkins FOR UPDATE 
USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS RLS - coach_feedback
-- =============================================
-- Los usuarios pueden ver feedback de sus check-ins
CREATE POLICY "Users can view feedback on their checkins" 
ON public.coach_feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.weekly_checkins 
    WHERE id = coach_feedback.checkin_id 
    AND user_id = auth.uid()
  )
);

-- Por ahora, cualquier usuario autenticado puede dar feedback (para demo)
-- En producción, esto se limitaría a coaches
CREATE POLICY "Authenticated users can create feedback" 
ON public.coach_feedback FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own feedback" 
ON public.coach_feedback FOR UPDATE 
USING (auth.uid() = coach_id);

-- =============================================
-- BUCKET DE STORAGE: checkin-photos
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('checkin-photos', 'checkin-photos', true);

-- Políticas de storage
CREATE POLICY "Users can view their own checkin photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own checkin photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own checkin photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own checkin photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- FUNCIÓN: Obtener número de semana ISO
-- =============================================
CREATE OR REPLACE FUNCTION public.get_current_week_info()
RETURNS TABLE(week_number INTEGER, year INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT 
    EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
END;
$$ LANGUAGE plpgsql STABLE;