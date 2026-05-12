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
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.rpc('login_usuario', {
    p_email: normalizedEmail,
    p_password: password,
  });

  if (error) {
    throw new Error(error.message || 'LOGIN_FAILED');
  }

  if (!data || data.length === 0) {
    // Mensaje mas preciso para UX en login.
    const { data: userRow, error: existsError } = await supabase
      .from('usuarios')
      .select('id,estado')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existsError) {
      throw new Error('LOGIN_FAILED');
    }

    if (!userRow) {
      throw new Error('USER_NOT_FOUND');
    }

    if (userRow.estado === false) {
      throw new Error('USER_INACTIVE');
    }

    throw new Error('INVALID_PASSWORD');
  }

  const usuario = normalizeUser(data[0] as Record<string, unknown>);
  saveToken(`supabase-session-${usuario.id}`);
  saveUser(usuario);
  return usuario;
};

export const logout = async () => {
  clearSession();
};
