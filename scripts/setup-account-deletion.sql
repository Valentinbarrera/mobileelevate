-- ============================================================================
-- SETUP: Borrar cuenta desde la app (requisito App Store 5.1.1(v))
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la función `public.delete_my_account()` que el ALUMNO puede llamar para
-- eliminar SU cuenta y TODOS sus datos personales. SECURITY DEFINER pero solo
-- borra lo del usuario autenticado (auth.uid / auth.email). Los alumnos se
-- vinculan por EMAIL → student_id IN (SELECT id FROM students WHERE email=…).
--
-- Nota: inline el subquery de email (sin variable) y delimitador $func$ para
-- que el "auto-RLS" del editor de Supabase no lo modifique.
-- ============================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  -- ── Datos personales del alumno ──────────────────────────────────────────
  -- Cada borrado en su propio bloque: si una tabla/columna no existe o una FK
  -- bloquea, se ignora y sigue (la función nunca se corta a la mitad).
  -- completed_exercises se referencia por completed_session_id (NO tiene student_id).
  -- Hay que borrarlas ANTES que completed_sessions (su padre).
  begin delete from public.completed_exercises where completed_session_id in (select id from public.completed_sessions where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.completed_sessions   where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.planned_sessions     where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.photo_comments where photo_id in (select id from public.progress_photos where student_id in (select id from public.students where email = auth.email())); exception when others then null; end;
  begin delete from public.progress_photos      where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.anthropometry        where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.athlete_onboarding   where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.nutrition_log_entries where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.daily_tracking       where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.messages             where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.routine_assignments  where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.meal_plan_assignments where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.device_tokens where email = auth.email(); exception when others then null; end;
  -- Datos sincronizados desde el teléfono (scripts/setup-athlete-sync.sql).
  -- Tienen ON DELETE CASCADE, pero los borramos explícito para no depender de eso.
  begin delete from public.readiness_entries where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.exercise_feedback where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.my_programs       where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.exercise_notes    where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.body_log          where student_id in (select id from public.students where email = auth.email()); exception when others then null; end;
  begin delete from public.students where email = auth.email(); exception when others then null; end;

  -- ── Fotos del storage (bucket privado, carpeta = uid) ────────────────────
  begin delete from storage.objects where bucket_id = 'progress-photos' and owner = auth.uid(); exception when others then null; end;

  -- ── El usuario de auth (login + identidades + sesiones) ──────────────────
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
