import api from './api';
import { supabase } from '../lib/supabase';
import type { Sucursal } from '../types';

const shouldUseSupabase = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return !apiUrl || apiUrl.includes('localhost');
};

export const fetchSucursales = async () => {
  if (shouldUseSupabase()) {
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
  if (shouldUseSupabase()) {
    const { data, error } = await supabase
      .from('sucursales')
      .insert({
        ...payload,
        estado: true
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Sucursal;
  }

  const { data } = await api.post('/sucursales', payload);
  return data.data as Sucursal;
};
