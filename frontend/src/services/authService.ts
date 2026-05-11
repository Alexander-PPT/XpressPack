import { clearSession, saveToken, saveUser } from './storageService';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.rpc('login_usuario', {
    p_email: email,
    p_password: password
  });

  if (error || !data || data.length === 0) {
    throw new Error(error?.message || 'Credenciales inválidas');
  }

  const usuario = data[0] as User;
  saveToken(`supabase-session-${usuario.id}`);
  saveUser(usuario);
  return usuario;
};

export const logout = async () => {
  clearSession();
};
