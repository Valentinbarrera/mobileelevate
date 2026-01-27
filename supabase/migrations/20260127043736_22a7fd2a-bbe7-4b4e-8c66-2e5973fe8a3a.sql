-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.get_current_week_info()
RETURNS TABLE(week_number INTEGER, year INTEGER) 
LANGUAGE plpgsql 
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT 
    EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
END;
$$;