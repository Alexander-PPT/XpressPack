-- XpressPack - Base de datos completa para Supabase
-- Ejecutar en Supabase SQL Editor.
-- Incluye: schema, indices, RLS/policies para demo, login RPC y CRUD admin de usuarios.

create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.rol_usuario as enum ('ADMIN', 'OPERARIO');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.estado_envio as enum ('Recibido', 'En Viaje', 'Entregado');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.estado_notificacion as enum ('PENDIENTE', 'ENVIADO', 'FALLIDO');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  codigo varchar(20) not null unique,
  ciudad varchar(50) not null,
  departamento varchar(50) not null,
  direccion varchar(255) not null,
  telefono varchar(20),
  email varchar(100),
  encargado varchar(100),
  estado boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  email varchar(100) not null unique,
  "passwordHash" varchar(255) not null,
  rol public.rol_usuario not null default 'OPERARIO',
  "sucursalId" uuid references public.sucursales(id) on delete set null,
  estado boolean not null default true,
  "telefonoContacto" varchar(20),
  "ultimoAcceso" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.envios (
  id uuid primary key default gen_random_uuid(),
  guia varchar(50) not null unique,
  "codigoTracking" varchar(20) not null unique,
  "remitenteDni" char(8) not null,
  "remitenteNombre" varchar(100) not null,
  "remitenteEmail" varchar(100) not null,
  "remitentePhone" varchar(20),
  "destinatarioDni" char(8) not null,
  "destinatarioNombre" varchar(100) not null,
  "destinatarioEmail" varchar(100) not null,
  "destinatarioPhone" varchar(20),
  peso numeric(8,2) not null,
  volumen numeric(8,2),
  dimensiones varchar(50),
  "tipoServicio" varchar(50) not null,
  descripcion text,
  estado public.estado_envio not null default 'Recibido',
  "sucursalOrigenId" uuid not null references public.sucursales(id),
  "sucursalDestinoId" uuid not null references public.sucursales(id),
  "operarioAsignadoId" uuid references public.usuarios(id) on delete set null,
  monto numeric(10,2),
  "valorDeclarado" numeric(10,2),
  "fechaEntrega" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint chk_envios_dni_remitente check ("remitenteDni" ~ '^[0-9]{8}$'),
  constraint chk_envios_dni_destinatario check ("destinatarioDni" ~ '^[0-9]{8}$'),
  constraint chk_envios_personas_distintas check ("remitenteDni" <> "destinatarioDni")
);

create table if not exists public.historiales_estados (
  id uuid primary key default gen_random_uuid(),
  "envioId" uuid not null references public.envios(id) on delete cascade,
  "estadoAnterior" public.estado_envio,
  "estadoNuevo" public.estado_envio not null,
  razon text,
  "operarioId" uuid references public.usuarios(id) on delete set null,
  ubicacion varchar(255),
  fotografia varchar(255),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo varchar(50) not null,
  "destinatarioEmail" varchar(100) not null,
  asunto varchar(255) not null,
  contenido text not null,
  "envioId" uuid references public.envios(id) on delete cascade,
  "usuarioId" uuid references public.usuarios(id) on delete set null,
  estado public.estado_notificacion not null default 'PENDIENTE',
  "mensajeError" text,
  intentos integer not null default 0,
  "proximoIntento" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.auditorias (
  id uuid primary key default gen_random_uuid(),
  "tipoAccion" varchar(50) not null,
  "entidadTipo" varchar(50) not null,
  "entidadId" uuid not null,
  "usuarioId" uuid references public.usuarios(id) on delete set null,
  detalles jsonb,
  "ipAddress" varchar(45),
  "userAgent" varchar(255),
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_usuarios_email on public.usuarios(email);
create index if not exists idx_usuarios_rol on public.usuarios(rol);
create index if not exists idx_usuarios_estado on public.usuarios(estado);
create index if not exists idx_usuarios_sucursal_id on public.usuarios("sucursalId");

create index if not exists idx_sucursales_codigo on public.sucursales(codigo);
create index if not exists idx_sucursales_ciudad on public.sucursales(ciudad);
create index if not exists idx_sucursales_estado on public.sucursales(estado);

create index if not exists idx_envios_guia on public.envios(guia);
create index if not exists idx_envios_codigo_tracking on public.envios("codigoTracking");
create index if not exists idx_envios_estado on public.envios(estado);
create index if not exists idx_envios_remitente_dni on public.envios("remitenteDni");
create index if not exists idx_envios_destinatario_dni on public.envios("destinatarioDni");
create index if not exists idx_envios_created_at on public.envios("createdAt");

create index if not exists idx_historiales_envio_id on public.historiales_estados("envioId");
create index if not exists idx_historiales_operario_id on public.historiales_estados("operarioId");
create index if not exists idx_historiales_created_at on public.historiales_estados("createdAt");

create index if not exists idx_notificaciones_estado on public.notificaciones(estado);
create index if not exists idx_notificaciones_envio_id on public.notificaciones("envioId");

create index if not exists idx_auditorias_tipo_accion on public.auditorias("tipoAccion");
create index if not exists idx_auditorias_usuario_id on public.auditorias("usuarioId");
create index if not exists idx_auditorias_entidad_id on public.auditorias("entidadId");

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

drop trigger if exists trg_sucursales_updated_at on public.sucursales;
create trigger trg_sucursales_updated_at
before update on public.sucursales
for each row execute function public.touch_updated_at();

drop trigger if exists trg_usuarios_updated_at on public.usuarios;
create trigger trg_usuarios_updated_at
before update on public.usuarios
for each row execute function public.touch_updated_at();

drop trigger if exists trg_envios_updated_at on public.envios;
create trigger trg_envios_updated_at
before update on public.envios
for each row execute function public.touch_updated_at();

drop trigger if exists trg_notificaciones_updated_at on public.notificaciones;
create trigger trg_notificaciones_updated_at
before update on public.notificaciones
for each row execute function public.touch_updated_at();

create or replace function public.crear_historial_envio_inicial()
returns trigger
language plpgsql
as $$
begin
  insert into public.historiales_estados ("envioId", "estadoAnterior", "estadoNuevo", razon, "operarioId")
  values (new.id, null, new.estado, 'Envio registrado', new."operarioAsignadoId");
  return new;
end;
$$;

drop trigger if exists trg_envios_historial_inicial on public.envios;
create trigger trg_envios_historial_inicial
after insert on public.envios
for each row execute function public.crear_historial_envio_inicial();

create or replace function public.crear_historial_envio_cambio_estado()
returns trigger
language plpgsql
as $$
begin
  if old.estado is distinct from new.estado then
    insert into public.historiales_estados ("envioId", "estadoAnterior", "estadoNuevo", razon, "operarioId")
    values (new.id, old.estado, new.estado, 'Cambio de estado', new."operarioAsignadoId");
  end if;
  return new;
end;
$$;

drop trigger if exists trg_envios_historial_cambio_estado on public.envios;
create trigger trg_envios_historial_cambio_estado
after update of estado on public.envios
for each row execute function public.crear_historial_envio_cambio_estado();

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
    and u."passwordHash" = extensions.crypt(p_password, u."passwordHash")
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

  if p_password is null or length(p_password) < 6 then
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
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    v_target_rol::public.rol_usuario,
    p_sucursal_id,
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

create or replace function public.update_usuario_admin(
  p_actor_email text,
  p_user_id uuid,
  p_nombre text default null,
  p_rol text default null,
  p_estado boolean default null,
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
set search_path = public
as $$
declare
  v_actor_rol text;
  v_target_rol text;
begin
  select u.rol::text into v_actor_rol
  from public.usuarios u
  where lower(u.email) = lower(trim(p_actor_email))
    and u.estado = true
  limit 1;

  if v_actor_rol <> 'ADMIN' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  v_target_rol := upper(coalesce(p_rol, ''));

  return query
  update public.usuarios u
  set
    nombre = coalesce(nullif(trim(p_nombre), ''), u.nombre),
    rol = case
      when v_target_rol in ('ADMIN', 'OPERARIO') then v_target_rol::public.rol_usuario
      else u.rol
    end,
    estado = coalesce(p_estado, u.estado),
    "sucursalId" = coalesce(p_sucursal_id, u."sucursalId")
  where u.id = p_user_id
  returning
    u.id,
    u.nombre::text,
    u.email::text,
    u.rol::text,
    u.estado,
    u."sucursalId";
end;
$$;

create or replace function public.deactivate_usuario_admin(
  p_actor_email text,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_rol text;
begin
  select u.rol::text into v_actor_rol
  from public.usuarios u
  where lower(u.email) = lower(trim(p_actor_email))
    and u.estado = true
  limit 1;

  if v_actor_rol <> 'ADMIN' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.usuarios
  set estado = false
  where id = p_user_id;

  return found;
end;
$$;

revoke all on function public.login_usuario(text, text) from public;
grant execute on function public.login_usuario(text, text) to anon, authenticated;

revoke all on function public.create_usuario_admin(text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_usuario_admin(text, text, text, text, text, text, uuid) to anon, authenticated;

revoke all on function public.update_usuario_admin(text, uuid, text, text, boolean, uuid) from public;
grant execute on function public.update_usuario_admin(text, uuid, text, text, boolean, uuid) to anon, authenticated;

revoke all on function public.deactivate_usuario_admin(text, uuid) from public;
grant execute on function public.deactivate_usuario_admin(text, uuid) to anon, authenticated;

alter table public.sucursales enable row level security;
alter table public.usuarios enable row level security;
alter table public.envios enable row level security;
alter table public.historiales_estados enable row level security;
alter table public.notificaciones enable row level security;
alter table public.auditorias enable row level security;

drop policy if exists "demo_select_sucursales" on public.sucursales;
create policy "demo_select_sucursales" on public.sucursales
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_sucursales" on public.sucursales;
create policy "demo_insert_sucursales" on public.sucursales
for insert to anon, authenticated with check (true);

drop policy if exists "demo_update_sucursales" on public.sucursales;
create policy "demo_update_sucursales" on public.sucursales
for update to anon, authenticated using (true) with check (true);

drop policy if exists "demo_select_usuarios" on public.usuarios;
create policy "demo_select_usuarios" on public.usuarios
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_usuarios" on public.usuarios;
create policy "demo_insert_usuarios" on public.usuarios
for insert to anon, authenticated with check (true);

drop policy if exists "demo_update_usuarios" on public.usuarios;
create policy "demo_update_usuarios" on public.usuarios
for update to anon, authenticated using (true) with check (true);

drop policy if exists "demo_select_envios" on public.envios;
create policy "demo_select_envios" on public.envios
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_envios" on public.envios;
create policy "demo_insert_envios" on public.envios
for insert to anon, authenticated with check (true);

drop policy if exists "demo_update_envios" on public.envios;
create policy "demo_update_envios" on public.envios
for update to anon, authenticated using (true) with check (true);

drop policy if exists "demo_select_historiales" on public.historiales_estados;
create policy "demo_select_historiales" on public.historiales_estados
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_historiales" on public.historiales_estados;
create policy "demo_insert_historiales" on public.historiales_estados
for insert to anon, authenticated with check (true);

drop policy if exists "demo_select_notificaciones" on public.notificaciones;
create policy "demo_select_notificaciones" on public.notificaciones
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_notificaciones" on public.notificaciones;
create policy "demo_insert_notificaciones" on public.notificaciones
for insert to anon, authenticated with check (true);

drop policy if exists "demo_select_auditorias" on public.auditorias;
create policy "demo_select_auditorias" on public.auditorias
for select to anon, authenticated using (true);

drop policy if exists "demo_insert_auditorias" on public.auditorias;
create policy "demo_insert_auditorias" on public.auditorias
for insert to anon, authenticated with check (true);

insert into public.sucursales (nombre, codigo, ciudad, departamento, direccion, telefono, email, encargado)
values
  ('Sucursal Lima Centro', 'LIM-001', 'Lima', 'Lima', 'Av. Garcilaso de la Vega 123', '014000001', 'lima@xpresspack.com', 'Administrador Lima'),
  ('Sucursal Arequipa', 'AQP-001', 'Arequipa', 'Arequipa', 'Av. Ejercito 456', '054400001', 'arequipa@xpresspack.com', 'Administrador Arequipa'),
  ('Sucursal Cusco', 'CUS-001', 'Cusco', 'Cusco', 'Av. El Sol 789', '084400001', 'cusco@xpresspack.com', 'Administrador Cusco')
on conflict (codigo) do nothing;

insert into public.usuarios (nombre, email, "passwordHash", rol, estado, "telefonoContacto")
values (
  'Alex',
  'alex@gmail.com',
  extensions.crypt('Alex4321', extensions.gen_salt('bf')),
  'ADMIN',
  true,
  '948433207'
)
on conflict (email) do update
set
  nombre = excluded.nombre,
  "passwordHash" = excluded."passwordHash",
  rol = excluded.rol,
  estado = true,
  "telefonoContacto" = excluded."telefonoContacto";

