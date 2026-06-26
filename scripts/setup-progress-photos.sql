-- ============================================================================
-- SETUP: Fotos de progreso (athlete app)
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Habilita que el ALUMNO:
--   1. Cree su propio registro de antropometría (para colgar fotos de ese mes).
--   2. Suba / vea / borre sus fotos de progreso (tabla progress_photos).
--   3. Lea los comentarios que el coach deja en sus fotos.
--   4. Suba archivos al bucket privado `progress-photos` (carpeta = su auth uid).
--
-- Los alumnos se vinculan por EMAIL (no hay user_id en `students`), por eso las
-- policies usan:  student_id IN (SELECT id FROM students WHERE email = auth.email())
-- ============================================================================

-- ── 1. Bucket privado para las fotos ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ── 2. RLS: anthropometry — el alumno puede leer y crear sus registros ──────
ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_own_anthropometry" ON public.anthropometry;
CREATE POLICY "students_select_own_anthropometry" ON public.anthropometry
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_anthropometry" ON public.anthropometry;
CREATE POLICY "students_insert_own_anthropometry" ON public.anthropometry
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- ── 3. RLS: progress_photos — el alumno gestiona sus fotos ──────────────────
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_own_photos" ON public.progress_photos;
CREATE POLICY "students_select_own_photos" ON public.progress_photos
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_insert_own_photos" ON public.progress_photos;
CREATE POLICY "students_insert_own_photos" ON public.progress_photos
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_update_own_photos" ON public.progress_photos;
CREATE POLICY "students_update_own_photos" ON public.progress_photos
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

DROP POLICY IF EXISTS "students_delete_own_photos" ON public.progress_photos;
CREATE POLICY "students_delete_own_photos" ON public.progress_photos
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE email = auth.email()));

-- Evita fotos duplicadas del mismo tipo para una misma medición (permite upsert)
CREATE UNIQUE INDEX IF NOT EXISTS progress_photos_anthro_type_uniq
  ON public.progress_photos (anthropometry_id, photo_type);

-- ── 4. RLS: photo_comments — el alumno LEE los comentarios de sus fotos ─────
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_comments_on_own_photos" ON public.photo_comments;
CREATE POLICY "students_select_comments_on_own_photos" ON public.photo_comments
  FOR SELECT TO authenticated
  USING (
    photo_id IN (
      SELECT id FROM public.progress_photos
      WHERE student_id IN (SELECT id FROM public.students WHERE email = auth.email())
    )
  );

-- ── 5. Storage policies del bucket `progress-photos` ────────────────────────
-- Cada alumno guarda en una carpeta nombrada con su auth uid:  {auth.uid}/...
DROP POLICY IF EXISTS "progress_photos_student_insert" ON storage.objects;
CREATE POLICY "progress_photos_student_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "progress_photos_student_select" ON storage.objects;
CREATE POLICY "progress_photos_student_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "progress_photos_student_update" ON storage.objects;
CREATE POLICY "progress_photos_student_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "progress_photos_student_delete" ON storage.objects;
CREATE POLICY "progress_photos_student_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 6. (COACH) Lectura de las fotos de sus alumnos ──────────────────────────
-- El coach ve las filas vía progress_photos (ajustar a tu modelo coach↔alumno).
-- Para servir el archivo, el panel del coach debería generar signed URLs con la
-- service role, o agregar acá una policy de SELECT en storage.objects que mapee
-- la carpeta (auth uid del alumno) con los alumnos del coach. Se deja como TODO
-- porque depende de cómo el panel del coach resuelve auth.uid -> students.
-- ============================================================================
