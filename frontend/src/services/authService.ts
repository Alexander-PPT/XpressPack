import { clearSession, saveToken, saveUser } from './storageService';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

const normalizeRole = (value: unknown): User['rol'] => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized === 'ADMIN' ? 'ADMIN' : 'OPERARIO';
};

const normalizeUser = (raw: Record<string, unknown>): User => ({
  id: String(raw.id ?? ''),
  nombre: String(raw.nombre ?? ''),
  email: String(raw.email ?? ''),
  rol: normalizeRole(raw.rol ?? raw.role),
  sucursalId: (raw.sucursalId as string | null | undefined) ?? null,
  estado: typeof raw.estado === 'boolean' ? raw.estado : true,
  createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
});

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.rpc('login_usuario', {
    p_email: email,
    p_password: password,
  });

  if (error || !data || data.length === 0) {
    throw new Error(error?.message || 'Credenciales invalidas');
  }

  const usuario = normalizeUser(data[0] as Record<string, unknown>);
  saveToken(`supabase-session-${usuario.id}`);
  saveUser(usuario);
  return usuario;
};

export const logout = async () => {
  clearSession();
};
