-- ============================================================================
-- SETUP: Borrar cuenta desde la app (requisito App Store 5.1.1(v))
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- Crea la función `public.delete_my_account()` que el ALUMNO puede llamar para
-- eliminar SU cuenta y TODOS sus datos personales. Corre como SECURITY DEFINER
-- (permisos elevados) pero solo borra lo del usuario autenticado (auth.uid /
-- auth.email). Los alumnos se vinculan por EMAIL → student_id IN (…email…).
--
-- No toca el contenido del coach (ejercicios, rutinas, planes, comidas): eso es
-- catálogo compartido, no data personal del alumno.
-- ============================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text := auth.email();
  v_ids   uuid[];
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select array_agg(id) into v_ids from public.students where email = v_email;

  -- ── Datos personales del alumno ──────────────────────────────────────────
  -- Cada borrado va en su propio bloque: si una tabla/columna no existe o una
  -- FK bloquea, se ignora y se sigue (la función nunca se corta a la mitad).
  if v_ids is not null then
    begin delete from public.completed_exercises where session_id in (select id from public.completed_sessions where student_id = any(v_ids)); exception when others then null; end;
    begin delete from public.completed_exercises where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.completed_sessions   where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.planned_sessions     where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.photo_comments where photo_id in (select id from public.progress_photos where student_id = any(v_ids)); exception when others then null; end;
    begin delete from public.progress_photos      where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.anthropometry        where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.athlete_onboarding   where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.nutrition_log_entries where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.daily_tracking       where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.messages             where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.routine_assignments  where student_id = any(v_ids); exception when others then null; end;
    begin delete from public.meal_plan_assignments where student_id = any(v_ids); exception when others then null; end;
    -- El registro del alumno
    begin delete from public.students where id = any(v_ids); exception when others then null; end;
  end if;

  -- ── Fotos del storage (bucket privado, carpeta = uid) ────────────────────
  begin delete from storage.objects where bucket_id = 'progress-photos' and owner = v_uid; exception when others then null; end;

  -- ── El usuario de auth (login + identidades + sesiones) ──────────────────
  delete from auth.users where id = v_uid;
end;
$$;

-- Solo usuarios autenticados pueden borrarse a sí mismos.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
