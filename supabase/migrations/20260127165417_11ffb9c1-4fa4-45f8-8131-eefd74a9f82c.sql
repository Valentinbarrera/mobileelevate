-- =============================================
-- FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- TABLA DE PERFILES DE USUARIO
-- =============================================

-- Crear tabla de perfiles para datos del onboarding
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  
  -- Datos biométricos del onboarding
  weight DECIMAL(5,2),
  height INTEGER,
  age INTEGER,
  gender TEXT CHECK (gender IN ('M', 'F')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense')),
  
  -- Objetivo de entrenamiento
  goal TEXT CHECK (goal IN ('muscle', 'fat_loss', 'performance', 'wellness')),
  
  -- Métricas calculadas
  bmi DECIMAL(4,1),
  bmr INTEGER,
  
  -- Gamificación
  xp_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  onboarding_data JSONB;
BEGIN
  -- Extraer datos del onboarding del metadata
  onboarding_data := NEW.raw_user_meta_data->'onboarding';
  
  INSERT INTO public.profiles (
    user_id,
    display_name,
    weight,
    height,
    age,
    gender,
    activity_level,
    goal,
    bmi,
    bmr
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    (onboarding_data->>'weight')::DECIMAL,
    (onboarding_data->>'height')::INTEGER,
    (onboarding_data->>'age')::INTEGER,
    onboarding_data->>'gender',
    onboarding_data->>'activityLevel',
    onboarding_data->>'goal',
    (onboarding_data->>'bmi')::DECIMAL,
    (onboarding_data->>'bmr')::INTEGER
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger en auth.users (solo para nuevos registros)
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();