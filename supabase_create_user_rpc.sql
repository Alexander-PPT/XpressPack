-- Ejecutar en Supabase SQL Editor
-- Crea un RPC para alta de usuarios desde frontend con validacion de ADMIN.

create extension if not exists pgcrypto;

create or replace function public.create_usuario_admin(
  p_actor_email text,
  p_nombre text,
  p_email text,
  p_password text,
  p_rol text default 'OPERARIO',
  p_telefono_contacto text default null
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
set search_path = public
as $$
declare
  v_actor_rol text;
  v_actor_activo boolean;
  v_target_rol text;
begin
  select u.rol::text, u.estado
    into v_actor_rol, v_actor_activo
  from usuarios u
  where lower(u.email) = lower(p_actor_email)
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

  if p_password is null or length(p_password) < 6 then
    raise exception 'INVALID_PASSWORD' using errcode = 'P0001';
  end if;

  v_target_rol := upper(coalesce(p_rol, 'OPERARIO'));
  if v_target_rol not in ('ADMIN', 'OPERARIO') then
    v_target_rol := 'OPERARIO';
  end if;

  return query
  insert into usuarios (
    nombre,
    email,
    "passwordHash",
    rol,
    estado,
    "telefonoContacto"
  )
  values (
    trim(p_nombre),
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    v_target_rol::rol_usuario,
    true,
    p_telefono_contacto
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

revoke all on function public.create_usuario_admin(text, text, text, text, text, text) from public;
grant execute on function public.create_usuario_admin(text, text, text, text, text, text) to anon, authenticated;

