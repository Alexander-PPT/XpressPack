import api from './api';
import { supabase } from '../lib/supabase';
import type { Sucursal } from '../types';
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
