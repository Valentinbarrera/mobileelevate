-- ==========================================================================
-- BLOQUE 0 de 7 - device_tokens (push notifications)
-- ==========================================================================
-- Parte de MIGRACION-COMPLETA-ASCII.sql, partida en pedazos para pegar de a
-- uno en el SQL Editor. Correr EN ORDEN, del 00 al 07. Cada bloque es
-- idempotente: si ya entro, volver a correrlo no rompe nada.
-- ==========================================================================

-- ############################################################################
-- 0/7 . device_tokens (push notifications)
-- fuente: scripts/setup-push-tokens.sql
-- ############################################################################
-- Va PRIMERO por una razon concreta: el bloque 7/7 le crea un indice a esta
-- tabla y delete_my_account() la referencia. Si no existiera, ese CREATE INDEX
-- falla y, como el editor corre todo en UNA transaccion, se cae la migracion
-- ENTERA. Con `create table if not exists` no rompe nada si ya estaba.

-- ============================================================================
-- SETUP: Tokens de dispositivo para push notifications
-- ----------------------------------------------------------------------------
-- Ejecutar UNA vez en el SQL Editor del dashboard de Supabase / Lovable Cloud
-- (proyecto gssgoeaupfssexhliazy).
--
-- La app (src/lib/pushNotifications.ts) guarda aca el device token de cada
-- alumno. El backend del coach usa estos tokens para enviar avisos (nueva
-- rutina, feedback, mensaje) via APNs/FCM. Se vincula por EMAIL, igual que el
-- resto del modelo (los alumnos no tienen user_id).
-- ============================================================================

create table if not exists public.device_tokens (
  token      text primary key,
  email      text not null,
  platform   text,
  updated_at timestamptz not null default now()
);

alter table public.device_tokens enable row level security;

-- El alumno solo puede ver/gestionar SUS propios tokens (email = auth.email()).
drop policy if exists "device_tokens_select_own" on public.device_tokens;
create policy "device_tokens_select_own" on public.device_tokens
  for select to authenticated using (email = auth.email());

drop policy if exists "device_tokens_insert_own" on public.device_tokens;
create policy "device_tokens_insert_own" on public.device_tokens
  for insert to authenticated with check (email = auth.email());

drop policy if exists "device_tokens_update_own" on public.device_tokens;
create policy "device_tokens_update_own" on public.device_tokens
  for update to authenticated using (email = auth.email()) with check (email = auth.email());

drop policy if exists "device_tokens_delete_own" on public.device_tokens;
create policy "device_tokens_delete_own" on public.device_tokens
  for delete to authenticated using (email = auth.email());
