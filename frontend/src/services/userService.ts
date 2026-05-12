import api from './api';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { getUser } from './storageService';

const shouldUseSupabase = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return !apiUrl || apiUrl.includes('localhost');
};

export const fetchUsers = async () => {
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id,nombre,email,rol,estado,"sucursalId"')
      .eq('estado', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return (data ?? []) as User[];
  }

  const { data } = await api.get('/users');
  return data.data as User[];
};

export const createUser = async (payload: {
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'OPERARIO';
  password: string;
  telefonoContacto?: string;
}) => {
  if (shouldUseSupabase()) {
    const currentUser = getUser<User>();
    if (!currentUser?.email) {
      throw new Error('NO_SESSION');
    }

    const { data, error } = await supabase.rpc('create_usuario_admin', {
      p_actor_email: currentUser.email,
      p_nombre: payload.nombre,
      p_email: payload.email,
      p_password: payload.password,
      p_rol: payload.rol,
      p_telefono_contacto: payload.telefonoContacto ?? null,
    });

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('USER_CREATE_FAILED');
    }

    return data[0] as User;
  }

  const { data } = await api.post('/users', payload);
  return data.data as User;
};
