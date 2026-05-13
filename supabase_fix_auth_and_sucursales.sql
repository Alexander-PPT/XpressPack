-- Ejecutar en Supabase SQL Editor.
-- Corrige login/creacion de usuarios y sucursales con funciones RPC consistentes.

create extension if not exists pgcrypto with schema extensions;

-- Limpia la version antigua de 6 parametros para que PostgREST no llame una firma vieja.
drop function if exists public.create_usuario_admin(text, text, text, text, text, text);

create or replace function public.login_usuario(p_email text, p_password text)
returns table (
  id uuid,
  nombre text,
  email text,
  rol text,
  "sucursalId" uuid,
  estado boolean
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    u.id,
    u.nombre::text,
    u.email::text,
    u.rol::text,
    u."sucursalId",
    u.estado
  from public.usuarios u
  where lower(u.email) = lower(trim(p_email))
    and u.estado = true
    and u."passwordHash" = extensions.crypt(trim(p_password), u."passwordHash")
  limit 1;
$$;

create or replace function public.create_usuario_admin(
  p_actor_email text,
  p_nombre text,
  p_email text,
  p_password text,
  p_rol text default 'OPERARIO',
  p_telefono_contacto text default null,
  p_sucursal_id uuid default null
)
returns table (
  id uuid,
  nombre text,
  email text,
  rol text,
  estado boolean,
  "sucursalId" uuid
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor_rol text;
  v_actor_activo boolean;
  v_target_rol text;
begin
  select u.rol::text, u.estado
    into v_actor_rol, v_actor_activo
  from public.usuarios u
  where lower(u.email) = lower(trim(p_actor_email))
  limit 1;

  if v_actor_rol is null then
    raise exception 'ACTOR_NOT_FOUND' using errcode = 'P0001';
  end if;

  if coalesce(v_actor_activo, false) = false then
    raise exception 'ACTOR_INACTIVE' using errcode = 'P0001';
  end if;

  if v_actor_rol <> 'ADMIN' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_nombre is null or length(trim(p_nombre)) < 3 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;

  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'INVALID_EMAIL' using errcode = 'P0001';
  end if;

  if p_password is null or length(trim(p_password)) < 6 then
    raise exception 'INVALID_PASSWORD' using errcode = 'P0001';
  end if;

  v_target_rol := upper(coalesce(p_rol, 'OPERARIO'));
  if v_target_rol not in ('ADMIN', 'OPERARIO') then
    v_target_rol := 'OPERARIO';
  end if;

  return query
  insert into public.usuarios (
    nombre,
    email,
    "passwordHash",
    rol,
    "sucursalId",
    estado,
    "telefonoContacto"
  )
  values (
    trim(p_nombre),
    lower(trim(p_email)),
    extensions.crypt(trim(p_password), extensions.gen_salt('bf')),
    v_target_rol::public.rol_usuario,
    p_sucursal_id,
    true,
    nullif(trim(coalesce(p_telefono_contacto, '')), '')
  )
  returning
    usuarios.id,
    usuarios.nombre::text,
    usuarios.email::text,
    usuarios.rol::text,
    usuarios.estado,
    usuarios."sucursalId";
end;
$$;

revoke all on function public.login_usuario(text, text) from public;
grant execute on function public.login_usuario(text, text) to anon, authenticated;

revoke all on function public.create_usuario_admin(text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_usuario_admin(text, text, text, text, text, text, uuid) to anon, authenticated;

-- Opcional para arreglar un usuario ya creado durante pruebas.
-- Cambia el email y la clave antes de ejecutar si necesitas reparar otro usuario.
-- update public.usuarios
-- set "passwordHash" = extensions.crypt('demo9876', extensions.gen_salt('bf'))
-- where lower(email) = lower('demo@gmail.com');
