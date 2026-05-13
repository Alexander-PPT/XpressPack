-- Ejecutar en Supabase SQL Editor.
-- Actualiza el estado de un envio desde el frontend validando usuario y transicion.

create or replace function public.update_envio_estado_admin(
  p_actor_email text,
  p_envio_id uuid,
  p_estado text
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
  "fechaEntrega" timestamptz,
  "createdAt" timestamptz
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_actor_id uuid;
  v_actor_rol text;
  v_actor_activo boolean;
  v_estado_actual public.estado_envio;
  v_estado_nuevo public.estado_envio;
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

  if p_estado not in ('Recibido', 'En Viaje', 'Entregado') then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;

  v_estado_nuevo := p_estado::public.estado_envio;

  select e.estado
    into v_estado_actual
  from public.envios e
  where e.id = p_envio_id
  limit 1;

  if v_estado_actual is null then
    raise exception 'SHIPMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_estado_actual = 'Entregado'::public.estado_envio then
    raise exception 'SHIPMENT_ALREADY_DELIVERED' using errcode = 'P0001';
  end if;

  if v_estado_actual = v_estado_nuevo then
    raise exception 'STATUS_UNCHANGED' using errcode = 'P0001';
  end if;

  if v_estado_actual = 'Recibido'::public.estado_envio and v_estado_nuevo <> 'En Viaje'::public.estado_envio then
    raise exception 'INVALID_TRANSITION' using errcode = 'P0001';
  end if;

  if v_estado_actual = 'En Viaje'::public.estado_envio and v_estado_nuevo <> 'Entregado'::public.estado_envio then
    raise exception 'INVALID_TRANSITION' using errcode = 'P0001';
  end if;

  return query
  update public.envios e
  set
    estado = v_estado_nuevo,
    "operarioAsignadoId" = v_actor_id,
    "fechaEntrega" = case
      when v_estado_nuevo = 'Entregado'::public.estado_envio then now()
      else e."fechaEntrega"
    end,
    "updatedAt" = now()
  where e.id = p_envio_id
  returning
    e.id,
    e.guia::text,
    e."codigoTracking"::text,
    e.estado::text,
    e."remitenteDni"::text,
    e."remitenteNombre"::text,
    e."destinatarioDni"::text,
    e."destinatarioNombre"::text,
    e."tipoServicio"::text,
    e.peso,
    e.dimensiones::text,
    e.descripcion,
    e."sucursalOrigenId",
    e."sucursalDestinoId",
    e."fechaEntrega",
    e."createdAt";
end;
$function$;

revoke all on function public.update_envio_estado_admin(text, uuid, text) from public;
grant execute on function public.update_envio_estado_admin(text, uuid, text) to anon, authenticated;
