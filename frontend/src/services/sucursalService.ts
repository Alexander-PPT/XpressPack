import api from './api';
import { supabase } from '../lib/supabase';
import type { Sucursal } from '../types';
import { getUser } from './storageService';
import { shouldUseSupabaseDirect } from './apiMode';

export const fetchSucursales = async () => {
  if (shouldUseSupabaseDirect()) {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('estado', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Sucursal[];
  }

  const { data } = await api.get('/sucursales');
  return data.data as Sucursal[];
};

export const createSucursal = async (payload: {
  nombre: string;
  codigo: string;
  ciudad: string;
  departamento: string;
  direccion: string;
}) => {
  if (shouldUseSupabaseDirect()) {
    const currentUser = getUser<{ email?: string }>();
    if (!currentUser?.email) {
      throw new Error('NO_SESSION');
    }

    const { data, error } = await supabase.rpc('create_sucursal_admin', {
      p_actor_email: currentUser.email,
      p_nombre: payload.nombre,
      p_codigo: payload.codigo,
      p_ciudad: payload.ciudad,
      p_departamento: payload.departamento,
      p_direccion: payload.direccion
    });

    if (error) throw error;
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('SUCURSAL_CREATE_FAILED');
    }

    return data[0] as Sucursal;
  }

  const { data } = await api.post('/sucursales', payload);
  return data.data as Sucursal;
};
