-- Ejecutar una sola vez en Supabase SQL Editor
create extension if not exists pgcrypto;

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
set search_path = public
as $$
  select
    u.id,
    u.nombre::text,
    u.email::text,
    u.rol::text,
    u."sucursalId",
    u.estado
  from usuarios u
  where lower(u.email) = lower(p_email)
    and u.estado = true
    and u."passwordHash" = crypt(p_password, u."passwordHash")
  limit 1;
$$;

revoke all on function public.login_usuario(text, text) from public;
grant execute on function public.login_usuario(text, text) to anon, authenticated;
