-- Ejecutar en Supabase SQL Editor.
-- Compatibiliza una base existente antigua con el formulario actual de envios.
-- No borra datos: solo agrega columnas faltantes si no existen.

alter table public.envios
  add column if not exists dimensiones varchar(50);

alter table public.envios
  add column if not exists "valorDeclarado" numeric(10,2);

alter table public.envios
  add column if not exists "operarioAsignadoId" uuid references public.usuarios(id) on delete set null;

alter table public.envios
  add column if not exists "remitenteEmail" varchar(100) default 'noreply@xpresspack.com';

alter table public.envios
  add column if not exists "destinatarioEmail" varchar(100) default 'noreply@xpresspack.com';

update public.envios
set
  "remitenteEmail" = coalesce("remitenteEmail", 'noreply@xpresspack.com'),
  "destinatarioEmail" = coalesce("destinatarioEmail", 'noreply@xpresspack.com');

alter table public.envios
  alter column "remitenteEmail" set not null;

alter table public.envios
  alter column "destinatarioEmail" set not null;
