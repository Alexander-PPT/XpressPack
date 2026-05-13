-- Ejecutar en Supabase SQL Editor.
-- Registra envios desde el frontend sin abrir INSERT directo sobre la tabla envios.

create or replace function public.create_envio_admin(
  p_actor_email text,
  p_remitente_dni text,
  p_remitente_nombre text,
  p_destinatario_dni text,
  p_destinatario_nombre text,
  p_sucursal_origen_id uuid,
  p_sucursal_destino_id uuid,
  p_peso numeric,
  p_dimensiones text,
  p_tipo_servicio text default 'ESTANDAR',
  p_descripcion text default null,
  p_valor_declarado numeric default 0
)
returns table (
  id uuid,
  guia text,
  "codigoTracking" text,
  estado text,
  "remitenteDni" text,
  "remitenteNombre" text,
  "destinatarioDni" text,
  "destinatarioNombre" text,
  "tipoServicio" text,
  peso numeric,
  dimensiones text,
  descripcion text,
  "sucursalOrigenId" uuid,
  "sucursalDestinoId" uuid,
  "createdAt" timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_actor_rol text;
  v_actor_activo boolean;
  v_guia text;
  v_tracking text;
begin
  select u.id, u.rol::text, u.estado
    into v_actor_id, v_actor_rol, v_actor_activo
  from public.usuarios u
  where lower(u.email) = lower(trim(p_actor_email))
  limit 1;

  if v_actor_id is null then
    raise exception 'ACTOR_NOT_FOUND' using errcode = 'P0001';
  end if;

  if coalesce(v_actor_activo, false) = false then
    raise exception 'ACTOR_INACTIVE' using errcode = 'P0001';
  end if;

  if v_actor_rol not in ('ADMIN', 'OPERARIO') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_remitente_dni !~ '^[0-9]{8}$' or p_destinatario_dni !~ '^[0-9]{8}$' then
    raise exception 'INVALID_DNI' using errcode = 'P0001';
  end if;

  if p_remitente_dni = p_destinatario_dni then
    raise exception 'SAME_PERSON' using errcode = 'P0001';
  end if;

  if p_remitente_nombre is null or length(trim(p_remitente_nombre)) < 3 then
    raise exception 'INVALID_SENDER' using errcode = 'P0001';
  end if;

  if p_destinatario_nombre is null or length(trim(p_destinatario_nombre)) < 3 then
    raise exception 'INVALID_RECEIVER' using errcode = 'P0001';
  end if;

  if p_sucursal_origen_id is null or p_sucursal_destino_id is null then
    raise exception 'INVALID_BRANCH' using errcode = 'P0001';
  end if;

  if p_sucursal_origen_id = p_sucursal_destino_id then
    raise exception 'SAME_BRANCH' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.sucursales s where s.id = p_sucursal_origen_id and s.estado = true) then
    raise exception 'ORIGIN_BRANCH_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.sucursales s where s.id = p_sucursal_destino_id and s.estado = true) then
    raise exception 'DESTINATION_BRANCH_NOT_FOUND' using errcode = 'P0001';
  end if;

  if coalesce(p_peso, 0) <= 0 then
    raise exception 'INVALID_WEIGHT' using errcode = 'P0001';
  end if;

  v_guia := 'GUIA-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(gen_random_uuid()::text, 1, 4));
  v_tracking := 'TRK' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  return query
  insert into public.envios (
    guia,
    "codigoTracking",
    "remitenteDni",
    "remitenteNombre",
    "remitenteEmail",
    "destinatarioDni",
    "destinatarioNombre",
    "destinatarioEmail",
    peso,
    dimensiones,
    "tipoServicio",
    descripcion,
    estado,
    "sucursalOrigenId",
    "sucursalDestinoId",
    "operarioAsignadoId",
    "valorDeclarado"
  )
  values (
    v_guia,
    v_tracking,
    p_remitente_dni,
    trim(p_remitente_nombre),
    'noreply@xpresspack.com',
    p_destinatario_dni,
    trim(p_destinatario_nombre),
    'noreply@xpresspack.com',
    p_peso,
    nullif(trim(coalesce(p_dimensiones, '')), ''),
    upper(coalesce(nullif(trim(p_tipo_servicio), ''), 'ESTANDAR')),
    nullif(trim(coalesce(p_descripcion, '')), ''),
    'Recibido'::public.estado_envio,
    p_sucursal_origen_id,
    p_sucursal_destino_id,
    v_actor_id,
    coalesce(p_valor_declarado, 0)
  )
  returning
    envios.id,
    envios.guia::text,
    envios."codigoTracking"::text,
    envios.estado::text,
    envios."remitenteDni"::text,
    envios."remitenteNombre"::text,
    envios."destinatarioDni"::text,
    envios."destinatarioNombre"::text,
    envios."tipoServicio"::text,
    envios.peso,
    envios.dimensiones::text,
    envios.descripcion,
    envios."sucursalOrigenId",
    envios."sucursalDestinoId",
    envios."createdAt";
end;
$$;

revoke all on function public.create_envio_admin(text, text, text, text, text, uuid, uuid, numeric, text, text, text, numeric) from public;
grant execute on function public.create_envio_admin(text, text, text, text, text, uuid, uuid, numeric, text, text, text, numeric) to anon, authenticated;
