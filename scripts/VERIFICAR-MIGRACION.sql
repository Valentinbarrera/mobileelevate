-- ############################################################################
-- VERIFICAR que la migración entró bien
-- ############################################################################
-- Pegar esto en el SQL Editor DESPUÉS de correr
-- scripts/MIGRACION-COMPLETA-2026-08-17.sql y darle Run.
--
-- Tiene que devolver 14 filas y TODAS en estado OK.
-- Si alguna dice FALTA, la migración no entró (se cayó entera, no a medias) →
-- volver a correrla y mirar el error que tira el editor.
--
-- Es de sólo lectura: no modifica nada, se puede correr las veces que quieras.
-- ############################################################################

select objeto, estado from (

  -- Las 10 tablas nuevas
  select t.name as objeto,
         case when to_regclass('public.' || t.name) is not null then 'OK' else 'FALTA' end as estado,
         1 as orden
  from (values
    ('device_tokens'),
    ('readiness_entries'),
    ('exercise_feedback'),
    ('my_programs'),
    ('exercise_notes'),
    ('body_log'),
    ('own_workout_sessions'),
    ('own_workout_sets'),
    ('evaluations'),
    ('anthropometry_measurements')
  ) as t(name)

  union all

  -- Los 3 campos del cuestionario que usa el generador de plan
  select 'athlete_onboarding.' || c.name,
         case when exists (
           select 1 from information_schema.columns
           where table_schema = 'public'
             and table_name = 'athlete_onboarding'
             and column_name = c.name
         ) then 'OK' else 'FALTA' end,
         2
  from (values ('session_minutes'), ('injury_severity'), ('avoided_exercises')) as c(name)

  union all

  -- El bucket privado donde va el Excel/PDF de las evaluaciones
  select 'bucket evaluations',
         case when exists (select 1 from storage.buckets where id = 'evaluations')
              then 'OK' else 'FALTA' end,
         3

) resultado
order by orden, objeto;
