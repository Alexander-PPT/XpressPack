-- XpressPack schema for Supabase (PostgreSQL)
-- Generated from backend Sequelize migrations

create extension if not exists "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'OPERARIO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_envio AS ENUM ('Recibido', 'En Viaje', 'Entregado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_notificacion AS ENUM ('PENDIENTE', 'ENVIADO', 'FALLIDO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tables
create table if not exists sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  codigo varchar(20) not null unique,
  ciudad varchar(50) not null,
  departamento varchar(50) not null,
  direccion varchar(255) not null,
  telefono varchar(20),
  email varchar(100),
  encargado varchar(100),
  estado boolean default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  email varchar(100) not null unique,
  "passwordHash" varchar(255) not null,
  rol rol_usuario default 'OPERARIO',
  "sucursalId" uuid,
  estado boolean default true,
  "telefonoContacto" varchar(20),
  "ultimoAcceso" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint fk_usuarios_sucursal
    foreign key ("sucursalId") references sucursales(id)
);

create table if not exists envios (
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
  "tipoServicio" varchar(50) not null,
  descripcion text,
  estado estado_envio default 'Recibido',
  "sucursalOrigenId" uuid not null,
  "sucursalDestinoId" uuid not null,
  "operarioAsignadoId" uuid,
  monto numeric(10,2),
  "fechaEntrega" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint fk_envios_sucursal_origen
    foreign key ("sucursalOrigenId") references sucursales(id),
  constraint fk_envios_sucursal_destino
    foreign key ("sucursalDestinoId") references sucursales(id),
  constraint fk_envios_operario
    foreign key ("operarioAsignadoId") references usuarios(id)
);

create table if not exists historiales_estados (
  id uuid primary key default gen_random_uuid(),
  "envioId" uuid not null,
  "estadoAnterior" estado_envio,
  "estadoNuevo" estado_envio not null,
  razon text,
  "operarioId" uuid,
  ubicacion varchar(255),
  fotografia varchar(255),
  "createdAt" timestamptz not null default now(),
  constraint fk_historial_envio
    foreign key ("envioId") references envios(id),
  constraint fk_historial_operario
    foreign key ("operarioId") references usuarios(id)
);

create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo varchar(50) not null,
  "destinatarioEmail" varchar(100) not null,
  asunto varchar(255) not null,
  contenido text not null,
  "envioId" uuid,
  "usuarioId" uuid,
  estado estado_notificacion default 'PENDIENTE',
  "mensajeError" text,
  intentos integer default 0,
  "proximoIntento" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint fk_notificaciones_envio
    foreign key ("envioId") references envios(id),
  constraint fk_notificaciones_usuario
    foreign key ("usuarioId") references usuarios(id)
);

create table if not exists auditorias (
  id uuid primary key default gen_random_uuid(),
  "tipoAccion" varchar(50) not null,
  "entidadTipo" varchar(50) not null,
  "entidadId" uuid not null,
  "usuarioId" uuid,
  detalles jsonb,
  "ipAddress" varchar(45),
  "userAgent" varchar(255),
  "createdAt" timestamptz not null default now(),
  constraint fk_auditorias_usuario
    foreign key ("usuarioId") references usuarios(id)
);

-- Indexes
create index if not exists idx_usuarios_email on usuarios(email);
create index if not exists idx_usuarios_rol on usuarios(rol);
create index if not exists idx_usuarios_sucursal_id on usuarios("sucursalId");

create index if not exists idx_sucursales_codigo on sucursales(codigo);
create index if not exists idx_sucursales_ciudad on sucursales(ciudad);

create index if not exists idx_envios_guia on envios(guia);
create index if not exists idx_envios_codigo_tracking on envios("codigoTracking");
create index if not exists idx_envios_estado on envios(estado);
create index if not exists idx_envios_remitente_dni on envios("remitenteDni");
create index if not exists idx_envios_destinatario_dni on envios("destinatarioDni");

create index if not exists idx_historiales_envio_id on historiales_estados("envioId");
create index if not exists idx_historiales_operario_id on historiales_estados("operarioId");
create index if not exists idx_historiales_created_at on historiales_estados("createdAt");

create index if not exists idx_notificaciones_estado on notificaciones(estado);
create index if not exists idx_notificaciones_envio_id on notificaciones("envioId");

create index if not exists idx_auditorias_tipo_accion on auditorias("tipoAccion");
create index if not exists idx_auditorias_usuario_id on auditorias("usuarioId");
create index if not exists idx_auditorias_entidad_id on auditorias("entidadId");
