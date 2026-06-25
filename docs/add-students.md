# Alta de alumnos (flujo "el coach invita")

La app mobile es solo para **alumnos** y **no tiene registro** propio: un alumno entra con
una cuenta que ya existe. El alta la dispara el coach. Este documento describe cómo
crear alumnos de forma automática, sin el trabajo manual de SQL fila por fila.

## Por qué hace falta un trigger especial

Dos reglas de la base condicionan todo:

1. **`handle_new_user()`** corre cada vez que se crea un usuario en `auth.users`. En su
   versión original **convierte a cualquier usuario nuevo en coach** (inserta en
   `coaches`). No distingue roles.
2. **RLS en `students`**: la política _"Students can view their own data"_ exige
   `students.id = auth.uid()`. Es decir, la fila del alumno debe tener el **mismo id**
   que su usuario de auth, o la app no puede leerla ("Sin coach asignado").

Por eso, para crear un alumno bien, el usuario de auth y la fila `students` tienen que
nacer **juntos y con el mismo id**. Eso se logra con un trigger que mire el rol.

## Paso 1 — Aplicar el trigger role-aware (una sola vez)

Corré esto en **Supabase → SQL Editor**. Es retrocompatible: si no se pasa `role`,
el usuario sigue siendo coach (comportamiento actual intacto).

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text := coalesce(new.raw_user_meta_data->>'role', 'coach');
  user_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1)
  );
begin
  if user_role = 'student' then
    begin
      insert into public.students (id, coach_id, email, full_name, status)
      values (
        new.id,
        (new.raw_user_meta_data->>'coach_id')::uuid,
        coalesce(new.email, ''),
        user_name,
        'active'
      )
      on conflict (id) do nothing;
    exception when others then
      raise warning 'No se pudo crear el alumno para %: %', new.id, sqlerrm;
    end;
  else
    begin
      insert into public.coaches (id, full_name, email)
      values (new.id, user_name, coalesce(new.email, ''))
      on conflict (id) do nothing;
    exception when others then
      raise warning 'No se pudo crear el coach para %: %', new.id, sqlerrm;
    end;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
```

> El trigger `on_auth_user_created` ya existe y apunta a esta función, así que no hay
> que recrearlo. Solo se reemplaza el cuerpo de la función.

### Rollback (volver a la versión "todos coach")

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_full_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1)
  );
begin
  begin
    insert into public.coaches (id, full_name, email)
    values (new.id, user_full_name, coalesce(new.email, ''))
    on conflict (id) do nothing;
  exception when others then
    raise warning 'Failed to create coach profile for user %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
```

## Paso 2 — Conseguir la service_role key

`Supabase → Project Settings → API → Project API keys → service_role` (secreta).
**No** la pegues en el repo ni en `.env` versionado: se pasa por variable de entorno
al correr el script.

## Paso 3 — Crear un alumno

Desde la carpeta del repo, en PowerShell:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
node scripts/invite-student.mjs <emailAlumno> <emailDelCoach> "<Nombre Completo>" [password]
```

- **Con `password`** (recomendado para probar): el alumno queda confirmado y puede
  entrar al instante.
  ```powershell
  node scripts/invite-student.mjs juan@gmail.com luxassilva@gmail.com "Juan Perez" juan123
  ```
- **Sin `password`**: se manda un email de invitación para que el alumno ponga su clave
  (requiere SMTP configurado en `Supabase → Authentication → Emails`).

El script resuelve el `coach_id` a partir del email del coach, crea el usuario con
`role: 'student'`, y el trigger inserta la fila en `students` con el id correcto. La app
ya lo ve sin pasos extra.

## Producción (cuando exista Elevate Web)

Lo ideal es mover el Paso 3 a un botón "Agregar alumno" en Elevate Web, llamando a una
Edge Function que use la service_role key del lado servidor (nunca en el cliente). La
lógica es la misma que la de este script.
