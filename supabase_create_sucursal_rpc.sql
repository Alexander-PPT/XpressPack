-- Ejecutar en Supabase SQL Editor.
-- Crea una funcion segura para registrar sucursales desde el frontend.
-- Evita hacer INSERT directo desde el cliente y valida que el actor sea ADMIN.

create or replace function public.create_sucursal_admin(
  p_actor_email text,
  p_nombre text,
  p_codigo text,
  p_ciudad text,
  p_departamento text,
  p_direccion text,
  p_telefono text default null,
  p_email text default null,
  p_encargado text default null
)
returns table (
  id uuid,
  nombre text,
  codigo text,
  ciudad text,
  departamento text,
  direccion text,
  telefono text,
  email text,
  encargado text,
  estado boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_rol text;
  v_actor_activo boolean;
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
    raise exception 'INVALID_BRANCH_NAME' using errcode = 'P0001';
  end if;

  if p_codigo is null or length(trim(p_codigo)) < 2 then
    raise exception 'INVALID_BRANCH_CODE' using errcode = 'P0001';
  end if;

  if p_ciudad is null or length(trim(p_ciudad)) < 2 then
    raise exception 'INVALID_CITY' using errcode = 'P0001';
  end if;

  if p_departamento is null or length(trim(p_departamento)) < 2 then
    raise exception 'INVALID_DEPARTMENT' using errcode = 'P0001';
  end if;

  if p_direccion is null or length(trim(p_direccion)) < 5 then
    raise exception 'INVALID_ADDRESS' using errcode = 'P0001';
  end if;

  return query
  insert into public.sucursales (
    nombre,
    codigo,
    ciudad,
    departamento,
    direccion,
    telefono,
    email,
    encargado,
    estado
  )
  values (
    trim(p_nombre),
    upper(trim(p_codigo)),
    trim(p_ciudad),
    trim(p_departamento),
    trim(p_direccion),
    nullif(trim(coalesce(p_telefono, '')), ''),
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    nullif(trim(coalesce(p_encargado, '')), ''),
    true
  )
  returning
    sucursales.id,
    sucursales.nombre::text,
    sucursales.codigo::text,
    sucursales.ciudad::text,
    sucursales.departamento::text,
    sucursales.direccion::text,
    sucursales.telefono::text,
    sucursales.email::text,
    sucursales.encargado::text,
    sucursales.estado;
end;
$$;

revoke all on function public.create_sucursal_admin(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_sucursal_admin(text, text, text, text, text, text, text, text, text) to anon, authenticated;
