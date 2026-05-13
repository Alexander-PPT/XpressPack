import api from './api';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { getUser } from './storageService';
import { shouldUseSupabaseDirect } from './apiMode';

export const fetchUsers = async () => {
  if (shouldUseSupabaseDirect()) {
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
  if (shouldUseSupabaseDirect()) {
    const currentUser = getUser<User>();
    if (!currentUser?.email) {
      throw new Error('NO_SESSION');
    }

    const { data, error } = await supabase.rpc('create_usuario_admin', {
      p_actor_email: currentUser.email.trim().toLowerCase(),
      p_nombre: payload.nombre.trim(),
      p_email: payload.email.trim().toLowerCase(),
      p_password: payload.password.trim(),
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

export const updateUserRole = async (userId: string, rol: 'ADMIN' | 'OPERARIO') => {
  if (shouldUseSupabaseDirect()) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ rol })
      .eq('id', userId)
      .select('id,nombre,email,rol,estado,"sucursalId"')
      .single();

    if (error) throw error;
    return data as User;
  }

  const { data } = await api.patch(`/users/${userId}`, { rol });
  return data.data as User;
};

export const deactivateUser = async (userId: string) => {
  if (shouldUseSupabaseDirect()) {
    const { error } = await supabase
      .from('usuarios')
      .update({ estado: false })
      .eq('id', userId);

    if (error) throw error;
    return true;
  }

  await api.delete(`/users/${userId}`);
  return true;
};
