-- ============================================================================
-- Permisos de LECTURA del coach sobre lo que el alumno carga desde la app.
--
-- Contexto: las tablas nuevas (daily_tracking, nutrition_log_entries y las 5 de
-- athlete-sync) ya traen su policy de coach. Las de FOTOS no: `setup-progress-
-- photos.sql` dejó la parte del coach como TODO porque dependía de cómo el panel
-- resuelve auth.uid -> students. Este script cierra eso.
--
-- Sin esto, la ficha del alumno en la web del coach devuelve 0 filas de fotos y
-- las signed URLs fallan — no por un bug del frontend, sino por RLS.
--
-- Modelo: students.coach_id = auth.uid() del coach.
--         El alumno se vincula a auth por EMAIL (students no tiene user_id).
--
-- Idempotente. NO cambia schema: sólo policies. Correr en el SQL Editor.
-- ============================================================================

-- ── 1. Filas de fotos y antropometría ───────────────────────────────────────
DROP POLICY IF EXISTS "coach_select_students_photos" ON public.progress_photos;
CREATE POLICY "coach_select_students_photos" ON public.progress_photos
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

DROP POLICY IF EXISTS "coach_select_students_anthropometry" ON public.anthropometry;
CREATE POLICY "coach_select_students_anthropometry" ON public.anthropometry
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid()));

-- ── 2. Comentarios del coach sobre las fotos ────────────────────────────────
-- El alumno ya puede LEER los comentarios de sus fotos. Acá el coach los ve y
-- los escribe.
DROP POLICY IF EXISTS "coach_select_photo_comments" ON public.photo_comments;
CREATE POLICY "coach_select_photo_comments" ON public.photo_comments
  FOR SELECT TO authenticated
  USING (
    photo_id IN (
      SELECT p.id FROM public.progress_photos p
      WHERE p.student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "coach_insert_photo_comments" ON public.photo_comments;
CREATE POLICY "coach_insert_photo_comments" ON public.photo_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    photo_id IN (
      SELECT p.id FROM public.progress_photos p
      WHERE p.student_id IN (SELECT id FROM public.students WHERE coach_id = auth.uid())
    )
  );

-- ── 3. El archivo en el bucket privado ──────────────────────────────────────
-- La carpeta del bucket es el auth uid del ALUMNO, pero `students` se vincula a
-- auth por email, así que hay que pasar por auth.users. Una policy no puede
-- leer auth.users directamente (el rol `authenticated` no tiene ese privilegio),
-- así que se encapsula en una función SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.coach_owns_student_folder(folder text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $fn$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.students s ON s.email = u.email
    WHERE u.id::text = folder
      AND s.coach_id = auth.uid()
  );
$fn$;

REVOKE ALL ON FUNCTION public.coach_owns_student_folder(text) FROM public;
GRANT EXECUTE ON FUNCTION public.coach_owns_student_folder(text) TO authenticated;

DROP POLICY IF EXISTS "progress_photos_coach_select" ON storage.objects;
CREATE POLICY "progress_photos_coach_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND public.coach_owns_student_folder((storage.foldername(name))[1])
  );

-- ── 4. Verificación ─────────────────────────────────────────────────────────
-- Logueado como coach, esto debería devolver las fotos de tus alumnos:
--   select p.id, p.photo_type, p.storage_path, a.date
--   from public.progress_photos p
--   join public.anthropometry a on a.id = p.anthropometry_id
--   order by a.date desc;
