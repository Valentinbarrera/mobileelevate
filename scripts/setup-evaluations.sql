-- =====================================================
-- ANTROPOMETRÍA — evaluaciones del alumno
-- =====================================================
-- Guarda el informe de antropometría completo (las ~50 variables del
-- fraccionamiento de 5 masas), que NO entra en la tabla vieja `anthropometry`
-- (sólo tiene 7 columnas).
--
-- NO TOCA NINGUNA TABLA EXISTENTE: crea dos tablas nuevas. Respeta el freeze.
--
-- Se corre tal cual en el SQL Editor de Supabase. Es idempotente: se puede
-- correr varias veces. Escrito PLANO a propósito (sin bloques DO/DECLARE): el
-- auto-RLS del editor de Supabase rompe los bloques anónimos.
--
-- Es la MISMA estructura que usa el módulo Evaluaciones de la web del coach, así
-- que lo que sube el alumno desde la app el coach lo ve desde la web, y al revés.
-- =====================================================


-- =====================================================
-- 1. EVALUATIONS (cabecera)
-- =====================================================
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  coach_id uuid references public.coaches(id) on delete set null,
  type text not null default 'anthropometry',
  measurement_date date not null default current_date,
  -- Objetivo que le fija el COACH a esta evaluación (el alumno sólo lo lee)
  goal text,
  goal_note text,
  notes text,
  -- De dónde salió, para poder auditar la interpretación
  source_file_name text,
  source_file_url text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_evaluations_student_type_date
  on public.evaluations(student_id, type, measurement_date);
create index if not exists idx_evaluations_student_id on public.evaluations(student_id);
create index if not exists idx_evaluations_coach_id on public.evaluations(coach_id);
create index if not exists idx_evaluations_date on public.evaluations(measurement_date desc);


-- =====================================================
-- 2. ANTHROPOMETRY_MEASUREMENTS (los valores)
-- =====================================================
-- Cada columna es el `id` de una variable en `src/types/evaluation.ts`.
create table if not exists public.anthropometry_measurements (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null unique references public.evaluations(id) on delete cascade,
  extra_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Las columnas van por separado con `add column if not exists` para que este
-- script sirva igual sobre una tabla creada por una versión anterior.

-- Datos generales
alter table public.anthropometry_measurements add column if not exists weight numeric;
alter table public.anthropometry_measurements add column if not exists height numeric;
alter table public.anthropometry_measurements add column if not exists sitting_height numeric;
alter table public.anthropometry_measurements add column if not exists age numeric;
alter table public.anthropometry_measurements add column if not exists sex text;

-- Composición corporal (kg)
alter table public.anthropometry_measurements add column if not exists muscle_mass numeric;
alter table public.anthropometry_measurements add column if not exists fat_mass numeric;
alter table public.anthropometry_measurements add column if not exists bone_mass numeric;
alter table public.anthropometry_measurements add column if not exists residual_mass numeric;
alter table public.anthropometry_measurements add column if not exists skin_mass numeric;
alter table public.anthropometry_measurements add column if not exists total_body_mass numeric;
alter table public.anthropometry_measurements add column if not exists body_fat_percentage numeric;
alter table public.anthropometry_measurements add column if not exists muscle_percentage numeric;

-- Índices
alter table public.anthropometry_measurements add column if not exists bmi numeric;
alter table public.anthropometry_measurements add column if not exists bone_mass_index numeric;
alter table public.anthropometry_measurements add column if not exists muscle_bone_index numeric;
alter table public.anthropometry_measurements add column if not exists adipose_muscle_index numeric;
alter table public.anthropometry_measurements add column if not exists waist_hip_ratio numeric;
alter table public.anthropometry_measurements add column if not exists projected_weight numeric;
alter table public.anthropometry_measurements add column if not exists basal_metabolism numeric;
alter table public.anthropometry_measurements add column if not exists energy_expenditure numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_endo numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_meso numeric;
alter table public.anthropometry_measurements add column if not exists somatotype_ecto numeric;

-- Pliegues (mm)
alter table public.anthropometry_measurements add column if not exists triceps_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists subscapular_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists biceps_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists iliac_crest_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists supraspinale_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists abdominal_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists thigh_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists calf_skinfold numeric;
alter table public.anthropometry_measurements add column if not exists sum_6_skinfolds numeric;
alter table public.anthropometry_measurements add column if not exists sum_8_skinfolds numeric;

-- Perímetros (cm)
alter table public.anthropometry_measurements add column if not exists relaxed_arm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists flexed_arm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists forearm_circumference numeric;
alter table public.anthropometry_measurements add column if not exists head_circumference numeric;
alter table public.anthropometry_measurements add column if not exists waist_circumference numeric;
alter table public.anthropometry_measurements add column if not exists hip_circumference numeric;
alter table public.anthropometry_measurements add column if not exists thigh_circumference numeric;
alter table public.anthropometry_measurements add column if not exists upper_thigh_circumference numeric;
alter table public.anthropometry_measurements add column if not exists calf_circumference numeric;
alter table public.anthropometry_measurements add column if not exists chest_circumference numeric;

-- Diámetros (cm)
alter table public.anthropometry_measurements add column if not exists humerus_breadth numeric;
alter table public.anthropometry_measurements add column if not exists femur_breadth numeric;
alter table public.anthropometry_measurements add column if not exists wrist_breadth numeric;
alter table public.anthropometry_measurements add column if not exists biacromial_breadth numeric;
alter table public.anthropometry_measurements add column if not exists biiliocristal_breadth numeric;
alter table public.anthropometry_measurements add column if not exists chest_transverse_breadth numeric;
alter table public.anthropometry_measurements add column if not exists chest_ap_breadth numeric;

create index if not exists idx_anthro_measurements_evaluation
  on public.anthropometry_measurements(evaluation_id);


-- =====================================================
-- 3. RLS
-- =====================================================
alter table public.evaluations enable row level security;
alter table public.anthropometry_measurements enable row level security;

-- --- El coach administra las de sus alumnos ---
drop policy if exists "Coaches manage their students evaluations" on public.evaluations;
create policy "Coaches manage their students evaluations"
  on public.evaluations
  for all
  using (student_id in (select id from public.students where coach_id = auth.uid()))
  with check (student_id in (select id from public.students where coach_id = auth.uid()));

-- --- El alumno LEE las suyas ---
-- Los alumnos se vinculan a auth por email, no por id.
drop policy if exists "Students read their own evaluations" on public.evaluations;
create policy "Students read their own evaluations"
  on public.evaluations
  for select
  using (student_id in (select id from public.students where email = auth.email()));

-- --- El alumno CARGA las suyas desde la app (subiendo el PDF) ---
drop policy if exists "Students insert their own evaluations" on public.evaluations;
create policy "Students insert their own evaluations"
  on public.evaluations
  for insert
  with check (student_id in (select id from public.students where email = auth.email()));

drop policy if exists "Students update their own evaluations" on public.evaluations;
create policy "Students update their own evaluations"
  on public.evaluations
  for update
  using (student_id in (select id from public.students where email = auth.email()))
  with check (student_id in (select id from public.students where email = auth.email()));

drop policy if exists "Students delete their own evaluations" on public.evaluations;
create policy "Students delete their own evaluations"
  on public.evaluations
  for delete
  using (student_id in (select id from public.students where email = auth.email()));

-- --- MEASUREMENTS: mismos permisos, vía la evaluación padre ---
drop policy if exists "Coaches manage their students measurements" on public.anthropometry_measurements;
create policy "Coaches manage their students measurements"
  on public.anthropometry_measurements
  for all
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.coach_id = auth.uid()
    )
  )
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.coach_id = auth.uid()
    )
  );

drop policy if exists "Students read their own measurements" on public.anthropometry_measurements;
create policy "Students read their own measurements"
  on public.anthropometry_measurements
  for select
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "Students insert their own measurements" on public.anthropometry_measurements;
create policy "Students insert their own measurements"
  on public.anthropometry_measurements
  for insert
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );

drop policy if exists "Students update their own measurements" on public.anthropometry_measurements;
create policy "Students update their own measurements"
  on public.anthropometry_measurements
  for update
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  )
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.students s on s.id = e.student_id
      where s.email = auth.email()
    )
  );


-- =====================================================
-- 4. updated_at automático
-- =====================================================
create or replace function public.set_evaluations_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

drop trigger if exists trg_evaluations_updated_at on public.evaluations;
create trigger trg_evaluations_updated_at
  before update on public.evaluations
  for each row execute function public.set_evaluations_updated_at();

drop trigger if exists trg_anthro_measurements_updated_at on public.anthropometry_measurements;
create trigger trg_anthro_measurements_updated_at
  before update on public.anthropometry_measurements
  for each row execute function public.set_evaluations_updated_at();


-- =====================================================
-- 5. STORAGE: bucket privado para los archivos originales
-- =====================================================
-- Lo usa la WEB del coach, que guarda el Excel que subió: la ruta es
-- {coach_id}/{student_id}/{archivo}. La app del alumno hoy NO sube el PDF
-- (sólo guarda el nombre del archivo en `source_file_name`), pero el alumno
-- necesita poder LEER el archivo que subió su coach.
insert into storage.buckets (id, name, public)
values ('evaluations', 'evaluations', false)
on conflict (id) do nothing;

drop policy if exists "Coaches manage evaluation files" on storage.objects;
create policy "Coaches manage evaluation files"
  on storage.objects
  for all
  using (bucket_id = 'evaluations' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'evaluations' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Students read their evaluation files" on storage.objects;
create policy "Students read their evaluation files"
  on storage.objects
  for select
  using (
    bucket_id = 'evaluations'
    and (storage.foldername(name))[2] in (
      select id::text from public.students where email = auth.email()
    )
  );
